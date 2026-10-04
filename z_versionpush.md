The page already points at a repo named job24-alert-tool-releases, so if you use that exact name, nothing in the code needs to change.


2. Publish the release

In the new repo, click Releases in the right sidebar, then Create a new release. You can also go straight to https://github.com/sk230144/job24-alert-tool-releases/releases/new.
Choose a tag: type v1.1.0 and click Create new tag.
Release title: Job 24 Alert Tool 1.0.0
Drag these three files from C:\Users\PC-8\Downloads\name-screen\name-screen\release into the Attach binaries box:
Job-24-Alert-Tool-Setup-1.0.0.exe
Job-24-Alert-Tool-1.0.0-arm64.dmg
Job-24-Alert-Tool-1.0.0-x64.dmg
Wait until all three finish uploading (about 1 GB in total), then click Publish release. Leave "Set as a pre-release" unticked, because the download links only follow the latest full release.
3. Check it
Open this in a browser. The installer should start downloading:
https://github.com/sk230144/job24-alert-tool-releases/releases/latest/download/Job-24-Alert-Tool-Setup-1.0.0.exe

4. Deploy the site
Push the latest code and Vercel will deploy it. After that, the download buttons on /interview-assistant work, and you don't need to set any environment variable.

For future versions

Build the new installers, for example 1.0.1.
Make a new release tagged v1.0.1 with those files.
Change APP_VERSION to "1.0.1" in desktop-app.ts and deploy.
Tell me once the release is published and I'll check that all three download links work.