# babel-plugin-styled-components-dataset

This plugin automatically adds dataset(`data-*`) to every component rendered with `styled-components` using `.attrs` method for better debugging and (E2E) Testing. For documentations of `styled-components` please visit the [styled-components official website](https://www.styled-components.com/docs/api#attrs).

## Installation

Install the plugin as development dependencies:

```
npm install --save-dev babel-plugin-styled-components-dataset
```

## Usage

Add the following line to your babel configuration:

```JSON
{
  "plugins": ["babel-plugin-styled-components-dataset"]
}
```

## Options

### `key`

`string`, defaults to `data-id`.

The attrubute name to add.

Example:

in **.babelrc**

```JSON
{
  "plugins": [["babel-plugin-styled-components-dataset", { "key": "data-test-key" }]]
}
```

in **path/to/TestComponent/index.js**

```javascript
const Container = styled.div`
  width: 100%;
`;
```

output:

```javascript
const Container = styled.div.attrs({ 'data-test-key': 'TestComponent_Container' }).div`width: 100%`;
```

eventually render to html as:

```html
<div data-test-key="TestComponent_Container"></div>
```
