# RedSocialJagobaAngular

Proyecto creado con [Angular CLI](https://github.com/angular/angular-cli) version 19.1.4.

## Lenguajes usados:
* TypeScript
* JavaScript

## Herramientas y  bibliotecas usados:

* Express
* NodeJS
* Sqlite3
* moment-timezone
* date-fns
* JWT-decode
* Bootstrap
* Bootstrap Icons
* Multer


## Arrancar el proyecto

Para arrancar el proyecto ejecutar en la carpeta backend:

```bash
node .\server.js
```
Ésto arrancará el backend para conectar con la base de datos.

Después arrancar el proyecto de forma normal, en la carpeta raíz del proyecto:

```bash
ng serve
```
Si en Windows da error al arrancar, hay que ejecutar el siguiente
comando: 

```bash
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
## FUNCIONAMIENTO:

Ésta aplicación es una red social básica.
Tiene:

* Registro: donde dar el alta al nuevo usuario
* Login: para iniciar sesión
* Inicio: lista de mensajes, aquí al estar logeado se permite
  dar like, y escribir mensajes.
* Detalle del mensaje: al hacer click en un mensaje se accede
  a otra pantalla en la cual se ven las respuestas y mas detalles de ese mensaje.
* Perfil: se puede modificar el nombre, el username, la contraseña y la foto de perfil.
* Header: aquí se puede ir a cualquier pantalla y cerrar sesión.

En cuanto al backend:
* La BDD es un archivo .db hecho con MySQLite y todas las interacciones están hechas con Sqlite3
* El backend está hecho con NodeJS y con Express.

Otros:
* La sesión se cierra sola cuando caduca el token (en 24h por defecto).
