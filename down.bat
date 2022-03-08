@echo off

 
cmd /k docker-compose -f docker-compose.yaml -p chat down --volumes --rmi all

exit