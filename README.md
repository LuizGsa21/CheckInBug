setup:

npm install
npm start

Users are reporting a bug stating that the app automaically checks them out after performing a checkin.

What you currenlty know?
- Bug is hard to reproduce.
- The high flux in users exposed this bug
- The bug is occuring once every ~7k checkins
- The bug is not in the backend.
- Users reporting the bug have not been forced checked out.

Provide a solution that drops the bug occurence to ZERO. HINT: there are multiple cases that need to be covered.

Features:
- Users can Check In and Check Out of retail locations
- Users can be forced checkout at any moment from the Admin Dashboard (you can simulated this via "npm run force-checkout")
