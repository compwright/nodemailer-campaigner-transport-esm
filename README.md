nodemailer-campaigner-transport-esm
===================================

## What is this?

nodemailer is a handy module for sending emails with Node.js using a variety of third party plug-and-play transports.
This is the transport plugin for sending email with [Campaigner](https://campaigner.com/).

## Installation

```bash
$ npm install --save nodemailer nodemailer-campaigner-transport-esm
```

## Example Usage

```javascript
import { createTransport } from 'nodemailer';
import CampaignerTransport from 'nodemailer-campaigner-transport-esm';

const mailer = createTransport(
  new CampaignerTransport({
    apiKey: 'key-1234123412341234',
    relaySendCategoryId: '1234'
  })
);

mailer.sendMail({
  from: 'myemail@example.com',
  to: 'recipient@domain.com', // An array if you have multiple recipients.
  cc: 'second@domain.com',
  bcc: 'secretagent@company.gov',
  subject: 'Hey you, awesome!',
  html: '<b>Wow Big powerful letters</b>',
  text: 'Mailgun rocks, pow pow!'
});
```
