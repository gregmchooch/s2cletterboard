@echo off
REM Setup script for GitHub repository

cd FixedStencilApp

REM Configure git
git config user.email "gregmchooch@github.com"
git config user.name "Greg McHooch"

REM Add all files
git add .

REM Initial commit
git commit -m "Initial commit: S2C Letter Board v1.0 - Stable Release

Features:
- 5x5 letter grid with magnification
- Touch-based letter selection
- Word spelling and history tracking
- Tested and working on iPad
- Full React Native + Expo implementation

Ready for GitHub deployment."

REM Add remote (you'll need to create the repo on GitHub first)
REM git remote add origin https://github.com/gregmchooch/s2cletterboard.git
REM git branch -M main
REM git push -u origin main

echo.
echo Setup complete! Next steps:
echo 1. Create a new repository on GitHub: https://github.com/new
echo 2. Name it: s2cletterboard
echo 3. Run these commands:
echo    git remote add origin https://github.com/gregmchooch/s2cletterboard.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo Then tag the release with:
echo    git tag -a v1.0-stable -m "Initial stable release"
echo    git push origin v1.0-stable
