# NodeImageResizer
Node Image Resizer with Sharp. If you find any bug feel free to open a new issue. (This is my first node project so I'm sorry if you don't like it :p)

# How to setup
1. Make sure you got node and npm installed.
2. Clone the repo
3. Run `npm i`
4. Run `node index.js`
5. Enjoy the server ;D

# Configuration
- `key`: The key used to clear the cache.

# How to use
Visit `{host}:3000/` and there you'll have the image resizer. These are the params:
- `url` [Required]: the original image url
- `width` [Optional]: the new width
- `height` [Optional]: the new height
- `resize` [Optional]: the resize format. It can be `cover`, `fill`, `contain`, `inside` or `outside`. (Click [here](https://sharp.pixelplumbing.com/api-resize#resize) for more information)
- `gravity` [Optional]: the gravity format. It can be `north`, `northeast`, `east`, `southeast`, `south`, `southwest`, `west`, `northwest`, `center` or `centre`. (Click [here](https://sharp.pixelplumbing.com/api-resize#resize) for more information)
- `format` [Optional]: the format of the image. It can be `png`, `jpg`, `jpeg`, `gif`, `webp` or `tiff`.

| Argument | Required | Type    | Default | Max Size |
|----------|----------|---------|---------|----------|
| url      | yes      | URL     | -       | 200      |
| width    | no       | Integer | -       | 4000     |
| height   | no       | Integer | -       | 4000     |
| format   | no       | String  | png     | -        |
| resize   | no       | String  | cover   | -        |
| gravity  | no       | String  | center  | -        |
