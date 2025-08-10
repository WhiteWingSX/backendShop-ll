# tienda backend

- El proyecto que consiste en manipular productos y carritos a traves de la metodologia CRUD y Rest server.

- Se agrega al proyecto Websockets con Socket.io y handlebars

- Se Modifica el proyecto para poder funcionar con MongoDB

- Se agrega un sistema de autenticacion y autorizacion

### Herramientas a utilizar:

* Postman
* MongoDB

### Como inicializar

1. descarga el proyecto de GitHud utilizando `git clone https://github.com/WhiteWingSX/BackendShop.git`
2. descarga los modulos de node `npm i`
3. inicia el proyecto `npm start`
4. Remplaza `.env.template` por `.env` y agrega tu link para conectarte a tus bases de datos de MongoDB
5. Inicializa MongoDB
6. Puedes ingresar a la ruta `http://localhost:8080/products` para poder ver la listas que vayas agregando a tu base de datos.
7. Puedes ingresar a la ruta `http://localhost:8080/carts/:cid` (:cid = id del carro) para poder ver la listas de productos en un carrito.

```
Proyecto creado con el fin de practicar y entenderlas tecnologias aplicadas.

                            Proyecto para CoderHouse 2025
```
