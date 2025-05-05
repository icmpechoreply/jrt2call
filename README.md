# Click-to-Call Middleware Service

A secure middleware service that enables click-to-call functionality between client websites and the NetSapiens PBX platform. Built with TypeScript, Express, and modern security practices.

## Features

- Secure call initiation and control through NetSapiens API
- HIPAA-compliant logging and data handling
- Token-based authentication
- Rate limiting and DDoS protection
- Input validation and sanitization
- Error handling and monitoring
- DTMF support
- Call status tracking

## Security Features

- HTTPS-only communication
- JWT token validation
- Request rate limiting
- CORS protection
- Security headers (via Helmet)
- Input validation
- Secure logging (HIPAA-compliant)
- No sensitive data exposure

## Prerequisites

- Node.js (v16 or higher)
- TypeScript
- NetSapiens API credentials
- Microsoft API Management subscription

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd click-to-call
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the environment variables in `.env` with your credentials.

## Configuration

The following environment variables are required:

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `JWT_SECRET`: Secret key for JWT validation
- `CORS_ORIGIN`: Allowed origin for CORS
- `NETSAPIENS_API_URL`: NetSapiens API endpoint
- `NETSAPIENS_SUBSCRIBER_TOKEN`: Your NetSapiens subscriber token
- `API_GATEWAY_URL`: Microsoft API Management gateway URL
- `LOG_LEVEL`: Logging level (info/warn/error)
- `RATE_LIMIT_WINDOW_MS`: Rate limiting window in milliseconds
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window

## Development

Start the development server:

```bash
npm run dev
```

## Building

Build the TypeScript code:

```bash
npm run build
```

## Production

Start the production server:

```bash
npm start
```

## API Endpoints

### Call Management

- `POST /api/calls/initiate`
  - Initiates a new call
  - Required body: `{ "phoneNumber": "+1234567890", "callerId": "+1987654321" }`

- `POST /api/calls/end/:callId`
  - Ends an active call
  - Required params: `callId`

- `POST /api/calls/dtmf/:callId`
  - Sends DTMF tones during a call
  - Required params: `callId`
  - Required body: `{ "digit": "0-9" }`

- `GET /api/calls/status/:callId`
  - Gets the status of a call
  - Required params: `callId`

## Security Best Practices

1. Always use HTTPS in production
2. Keep dependencies updated
3. Use environment variables for sensitive data
4. Implement proper error handling
5. Use rate limiting
6. Validate all inputs
7. Follow HIPAA compliance guidelines
8. Monitor and log securely

## Error Handling

The application uses a centralized error handling system. All errors are logged and sanitized before being sent to the client.

## Logging

HIPAA-compliant logging is implemented using Winston:
- Error logs: `./logs/error.log`
- Combined logs: `./logs/combined.log`

## Testing

Run the test suite:

```bash
npm test
```

## Client Integration

To integrate the click-to-call button in your website:

1. Add the button HTML:
```html
<button id="click-to-call" data-phone="+1234567890">Call Us</button>
```

2. Include the JavaScript:
```html
<script src="/path/to/click-to-call.js"></script>
```

3. Initialize the click-to-call functionality:
```javascript
const clickToCall = new ClickToCall({
  apiUrl: 'https://your-api-gateway.com',
  token: 'your-jwt-token'
});
```

## License

[MIT License](LICENSE)

## Support

For support, please contact [your-email@example.com] 