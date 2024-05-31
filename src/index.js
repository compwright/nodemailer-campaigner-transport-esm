import assert from 'node:assert'
import { readFile } from 'node:fs/promises'
import { Readable } from 'node:stream'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

const packageData = require('../package.json')

async function buildAttachment (attachment) {
  assert.ok(!attachment.raw, 'raw attachments not supported')
  assert.ok(!attachment.href, 'url attachments not supported')
  assert.ok(!(attachment.content instanceof Readable), 'stream attachments not supported')
  assert.ok(attachment.filename, 'missing filename for attachment')
  assert.ok(attachment.filename, 'missing content type for attachment')
  const content = attachment.path
    ? await readFile(attachment.path)
    : Buffer.from(attachment.content, attachment.encoding)
  return {
    Name: attachment.filename,
    ContentType: attachment.contentType,
    Content: content.toString('base64')
  }
}

async function createRequest ({ message, data }, trackLinks, forceDelivery) {
  const addresses = message.getAddresses()
  const requestBody = {
    Subject: data.subject,
    FromName: addresses.from[0].name,
    FromEmail: addresses.from[0].address,
    Recipients: addresses.to.map(address => ({
      ToName: address.name,
      ToEmail: address.address
    })),
    AddToDatabase: false,
    TrackLinks: trackLinks,
    Force: forceDelivery
  }
  if (data.text) {
    requestBody.Text = data.text
  }
  if (data.html) {
    requestBody.HTML = data.html
  }
  if (data.attachments) {
    requestBody.Attachments = await Promise.all(
      data.attachments.map(buildAttachment)
    )
  }
  return requestBody
}

class CampaignerTransport {
  name = 'Campaigner'

  version = packageData.version

  #apiUrl
  #apiKey
  #timeout
  #trackLinks
  #forceDelivery

  constructor ({
    url = 'https://edapi.campaigner.com',
    host = null,
    protocol = null,
    port = null,
    timeout = null,
    apiKey = '',
    relaySendCategoryId = '',
    trackLinks = true,
    forceDelivery = true
  }) {
    this.#apiKey = apiKey
    this.#timeout = timeout
    this.#trackLinks = trackLinks
    this.#forceDelivery = forceDelivery
    if (url) {
      this.#apiUrl = url + '/v1/RelaySends/' + relaySendCategoryId
    } else {
      const url = new URL('https://' + host)
      if (protocol) {
        url.protocol = protocol
      }
      if (port) {
        url.port = port
      }
      this.#apiUrl = url.toString() + '/v1/RelaySends/' + relaySendCategoryId
    }
  }

  async sendAsync (mail) {
    const controller = new AbortController()
    const signal = controller.signal
    if (this.#timeout) {
      setTimeout(() => controller.abort(), this.#timeout)
    }

    const requestData = await createRequest(mail, this.#trackLinks, this.#forceDelivery)

    const response = await fetch(this.#apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ApiKey: this.#apiKey
      },
      signal,
      body: JSON.stringify(requestData)
    })

    const data = await response.json()

    if (data?.ErrorCode) {
      throw new Error(`Error ${data.ErrorCode}: ${data.Message}`)
    }

    if (!response.ok) {
      throw response
    }

    return data.Receipts[0]
  }

  send (mail, callback) {
    this.sendAsync(mail).then(
      data => callback(null, data),
      error => callback(error)
    )
  }
}

export default CampaignerTransport
