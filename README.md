setup:

```bash
npm install
npm start
```

Users are reporting a bug stating that the app automaically checks them out after performing a checkin:
<img width="1597" alt="Screenshot 2023-09-08 at 12 26 30 PM" src="https://github.com/LuizGsa21/CheckInBug/assets/8405562/a9f114b7-7b16-4c09-95c7-b160d04ce409">


What you currenlty know?
- Bug is hard to reproduce.
- The high flux in users exposed this bug
- Of ~7k checkins, 1 user will report this issue
- The bug is not in the backend.
- Users reporting the bug have not been forced checked out.

Provide a solution that drops the bug occurence to ZERO. HINT: there are multiple cases that need to be covered.

Features:
- Users can Check In and Check Out of retail locations
- Users can be forced checkout at any moment from the Admin Dashboard (you can simulated this via "npm run force-checkout")
