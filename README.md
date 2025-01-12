# SSSC Mentor Enhancement Project
SSSC Student Mentor matching system

Drive link: https://drive.google.com/drive/u/0/folders/1i33NqPlPEY8DUpU--6pJ_c9rGIfTuduO

Testing: https://docs.google.com/document/d/1IJhup_TdB21PBaKfDjdq4_StCMfLrxqPmC36cSX0Yog/edit?usp=sharing

Some technical details: https://docs.google.com/document/d/1uO0Apu2Nk6t8Gt5CQ1HnMXBAO6Q8USpgeix9NUpG7Rg/edit


When running the app, ensure you replace the DATABASE_URL with your actual database url from postgres

To deploy the server, you must compile and commit the dist files.

# Deployment
```bash
cd server
npx tsc
git add .
```

This is because Vercel couldn't compile our server builds, so we have
to do it manually. The settings are configured to directly serve express
routes out of /server/dist.
