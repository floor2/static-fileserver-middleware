# Static Fileserver Middleware

![Window Middlware](window.jpg "Window Middlware")

Serve static files from any route and any folder, like a window into an underlying filesystem.

## Installation

```
yarn install static-fileserver-middleware
```

## Usage

Example app:

```
var static = require('static-fileserver-middleware');
var app = require('express')();

app.get('/', (r, res) => res.send('<a href="/ok">Files</a>'));
app.use(static({ rootDir: './public' }));

app.listen(3000);
```

Example with different baseUrl:

```
var static = require('static-fileserver-middleware');
var app = require('express')();

var baseUrl = '/ok'
app.get('/', (r, res) => res.send('<a href="/ok">Files</a>'));
app.use(baseUrl, static({ baseUrl, rootDir: './public' }));

app.listen(3000);
```

### Options


|Option|Type|
|-|-|
|baseUrl|`String`|
|rootDir|`String`|

# Justification

The reasoning for making a new library for this was because none of the other
ones worked when mounted not at the root.
