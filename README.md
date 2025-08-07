# AI Kiosk Event Registration System

A Next.js application for handling event registration through an AI Kiosk system. This application is designed to work with a kiosk that scans QR codes, captures photos, and prints visitor badges.

## Features

- QR code scanning integration (handled by kiosk)
- User identification via query parameters
- User information display
- Browser camera integration for photo capture
- Bluetooth printing support via RAWBT protocol
- Responsive design with shadcn/ui components
- Mock database with Supabase client structure

## Flow

1. Visitor receives QR code via email before the event
2. At the event, visitor scans QR code at the kiosk (via camera)
3. Kiosk reads QR code and extracts unique ID/reference
4. Opens custom website with `?id=unique_ref` on Android browser
5. Website reads query string and fetches user info from internal DB
6. Displays personalized info on website UI
7. Prompts user to take photo via browser camera
8. User confirms and presses Register button
9. Website combines info + photo into printable format (ESC/POS)
10. Sends print command to RAWBT via base64 URL
11. Bluetooth thermal printer prints badge/photo/info
12. Registration complete

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Testing

For testing purposes, the application includes mock user data. You can test the registration flow by clicking on the test user links on the homepage or by navigating to:

```
/register?id=REF001
/register?id=REF002
/register?id=REF003
/register?id=REF004
/register?id=REF005
```

## Technical Details

### Tech Stack

- Next.js 15.4.6
- React 19.1.0
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Supabase (mock implementation)

### Key Components

- `Camera`: Component for accessing and using the device camera
- `UserProfile`: Displays user information
- `RegistrationForm`: Handles the complete registration flow

### Bluetooth Printing

The application uses the RAWBT protocol for sending print commands to Bluetooth thermal printers. In a production environment, you would need to:

1. Format the print data according to ESC/POS standards
2. Convert the data to base64
3. Generate a RAWBT URL (`rawbt://base64,<base64_encoded_data>`)
4. Open this URL to trigger the print job

## Deployment

This application is designed to be deployed on a web server accessible by the kiosk's Android browser. For production use, you would need to:

1. Set up a real Supabase database or other backend
2. Configure environment variables for API keys
3. Implement proper error handling and logging
4. Test the Bluetooth printing functionality with actual hardware

## License

MIT
