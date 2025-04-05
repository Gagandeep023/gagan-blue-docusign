# DocuSign Integration Project

This project provides a web application for managing document signing workflows using DocuSign's eSignature API.

## Project Structure

```
├── lib/
│   ├── controllers/
│   │   ├── documentController.js    # Handles document listing, viewing, and editing
│   │   ├── envelopeController.js    # Manages envelope creation and sending
│   │   └── statusController.js      # Handles success/failure page rendering
│   ├── services/
│   │   ├── createTemplateServices.js # Creates DocuSign templates
│   │   └── SendEnvelopeServices.js   # Sends envelopes using templates
│   └── utils/
│       └── logger.js                 # Logging utility
├── tests/
│   ├── controllers/
│   │   ├── documentController.test.js
│   │   ├── envelopeController.test.js
│   │   └── statusController.test.js
│   └── services/
│       └── SendEnvelopeServices.test.js
└── views/
    └── pages/
        ├── docs-list.ejs
        ├── view-doc.ejs
        ├── edit-doc.ejs
        ├── success_page.ejs
        ├── failure_page.ejs
        └── something_went_wrong_page.ejs
```

## Features

### Document Management
- List available documents
- View document details
- Edit document settings
- Upload new documents

### Template Creation
- Create DocuSign templates from documents
- Configure signer roles and positions
- Set up signature and text fields

### Envelope Management
- Send envelopes using templates
- Track envelope status
- Handle success/failure scenarios

## Controllers

### Document Controller
- `docsList`: Renders the document listing page
- `viewDoc`: Renders the document viewing page
- `editDoc`: Renders the document editing page

### Envelope Controller
- `createTemplateAndSendEnvelope`: 
  - Creates a DocuSign template
  - Sends an envelope using the template
  - Handles success/failure redirects

### Status Controller
- `success`: Renders the success page
- `failure`: Renders the failure page
- `somethingWentWrong`: Renders the error page

## Services

### Template Service
- `createTemplate`: Creates a DocuSign template
- `makeTemplateForSigning`: Configures template settings

### Envelope Service
- `sendEnvelopeFromTemplate`: Sends an envelope using a template
- `makeEnvelope`: Configures envelope settings

## Testing

The project includes comprehensive test coverage for:
- Controller functionality
- Service operations
- Error handling
- Edge cases

### Running Tests
```bash
npm test
```

## Error Handling

The application implements robust error handling:
- Input validation
- API error handling
- Session management
- Graceful error page rendering

## Logging

The application uses a custom logger for:
- Error tracking
- Operation logging
- Debug information

## Dependencies

- Express.js
- DocuSign eSignature API
- EJS templating
- Chai/Sinon for testing

## Configuration

Required environment variables:
- `DS_ACCESS_TOKEN`: DocuSign access token
- `DS_ACCOUNT_ID`: DocuSign account ID
- `DS_BASE_PATH`: DocuSign API base path

## Getting Started

1. Install dependencies:
```bash
npm install
```
2. Create the `config/appsettings.json` file and ask the admin for the necessary data to populate it.

3. Start the application:
```bash
npm start
```

