import assert from 'node:assert'
import { test } from '@jest/globals'
import fetchMock from 'fetch-mock'
import CampaignerTransport from './index'

const transport = new CampaignerTransport({
  apiKey: 'foo',
  relaySendCategoryId: '101'
})

fetchMock.config.Request = Request

test('should send a message', async function () {
  fetchMock.post(
    {
      url: 'https://edapi.campaigner.com/v1/RelaySends/101',
      headers: {
        'Content-Type': 'application/json',
        ApiKey: 'foo'
      },
      body: {
        Recipients: [],
        Subject: 'Bar',
        Text: 'Baz'
      },
      matchPartialBody: true
    },
    {
      Receipts: [
        {
          RelaySendReceiptID: 533,
          Result: 'Success'
        }
      ]
    }
  )

  const result = await transport.sendAsync({
    message: {
      getAddresses: () => ([])
    },
    data: {
      subject: 'Bar',
      text: 'Baz'
    }
  })

  assert.strictEqual(result.messageId, 533)

  fetchMock.reset()
})
