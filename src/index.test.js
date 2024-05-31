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
        FromName: 'Test Sender',
        FromEmail: 'test@test.com',
        Recipients: [{
          ToName: 'John Doe',
          ToEmail: 'john.doe@test.com'
        }],
        Subject: 'Bar',
        Text: 'Baz'
      },
      matchPartialBody: true
    },
    {
      Receipts: [
        {
          Result: 'Success'
        }
      ]
    }
  )

  const result = await transport.sendAsync({
    message: {
      getAddresses: () => ({
        from: [{
          name: 'Test Sender',
          address: 'test@test.com'
        }],
        to: [{
          name: 'John Doe',
          address: 'john.doe@test.com'
        }]
      })
    },
    data: {
      subject: 'Bar',
      text: 'Baz'
    }
  })

  assert.strictEqual(result.Result, 'Success')

  fetchMock.reset()
})
