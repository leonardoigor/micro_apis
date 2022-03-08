@echo off

cmd /k docker-compose -f ./docker-compose.yaml -p chat up --renew-anon-volumes


exit