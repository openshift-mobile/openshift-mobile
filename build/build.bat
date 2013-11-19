@echo off

set build_dir=%cd%

echo Building working directory
IF NOT EXIST work GOTO CHECKDONE
rmdir /s /q work
:CHECKDONE

mkdir work 
cd work
mkdir .cordova merges platforms plugins www
xcopy /e /v /q /s ..\..\.cordova .cordova >nul
xcopy /e /v /q /s ..\..\plugins plugins >nul
xcopy /e /v /q /s ..\..\www www >nul

echo Minifying javascript
cd www\js

for /r %%i in (*.js) do "%JAVA_HOME%\bin\java" -jar "%build_dir%\yuicompressor-2.4.8.jar" --type js "%%~nxi" -o "%%~nxi"

echo Minifying css
cd ..\css
for /r %%i in (*.css) do "%JAVA_HOME%\bin\java" -jar "%build_dir%\yuicompressor-2.4.8.jar" --type css "%%~nxi" -o "%%~nxi"

echo Compressing PNG images
cd ..\
for /r %%i in (*.png) do "%build_dir%\pngquant.exe" -f --ext ".png" %%i

echo Building applications
cd ..\
cmd /k "phonegap local build android >nul & exit"
cd platforms\android
cmd /k "%ANT_HOME%\bin\ant release >nul & exit"

cd "%build_dir%"
echo Building Dist
IF NOT EXIST dist GOTO DISTDONE
rmdir /s /q dist
:DISTDONE

mkdir dist
xcopy /e /v /q work\platforms\android\bin\*.apk dist\ >nul

echo "Cleaning up"
rmdir /s /q work

cd "%build_dir%"

@cmd /c echo.
@cmd /c echo.
@cmd /c echo.
echo COMPLETE! You can find your packages in the dist/ directory
@cmd /c echo.
pause
