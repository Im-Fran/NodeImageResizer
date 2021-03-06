const isImageURL = require('image-url-validator').default
const express = require('express')
const request = require('request').defaults({ encoding: null })
const sharp = require('sharp')
const md5 = require("crypto-js/md5");
const fs = require('fs');
const path = require("path");
const rimraf = require("rimraf");
const app = express()
let configPath = path.join(__dirname, 'config.json')
let config = {key: '', port: 3000, maxWidth: 4000, maxHeight: 4000, maxUrlLength: 200}
if(fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath).toString())
}

if(!fs.existsSync(configPath) || config.key.length < 5){
    if(config.key === ''){
        console.log('Key is empty. Generating new one')
    }else if(config.key.length < 5){
        console.log('Key is too short. Generating new one.')
    }

    let key = '';
    for (var i = 0; i < 100; i++ ) {
        key += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@*()[]{},.:;_-+$'.charAt(Math.floor(Math.random() * 79));
    }
    config.key = key
    let content = JSON.stringify(config)
    fs.writeFileSync(configPath, content)
}
const port = process.env.PORT || config.port

app.get('/', (req, res) => {
    let query = req.query
    if(!query.url){
        res.status(400).send(JSON.stringify({'status': 'error', 'msg': 'invalid url'}))
    } else {
        let url = query.url
        if(url.length > config.maxUrlLength){
            res.status(400).send(JSON.stringify({'status': 'error', 'msg': 'url too long. Max 200 characters'}))
            return;
        }
        let width = Number.parseInt(query.width || 0)
        let height = Number.parseInt(query.height || 0)
        let resize = (query.resize || 'cover').toLowerCase()
        if(width > config.maxWidth) width = config.maxWidth
        if(height > config.maxHeight) height = config.maxHeight
        let gravity = (query.gravity || 'center').toLowerCase()
        let format = (query.format || 'jpg').toLowerCase()
        if(resize !== 'cover' && resize !== 'contain' && resize !== 'fill' && resize !== 'inside' && resize !== 'outside'){
            res.status(400).send(JSON.stringify({'status': 'error', 'msg': `invalid resize '${resize}'`}))
            return;
        }
        if(gravity !== 'north' && gravity !== 'northeast' && gravity !== 'east' && gravity !== 'southeast' && gravity !== 'south' && gravity !== 'southwest' && gravity !== 'west' && gravity !== 'northwest' && gravity !== 'center' && gravity !== 'centre'){
            res.status(400).send(JSON.stringify({'status': 'error', 'msg': `invalid gravity '${gravity}'`}))
            return;
        }
        if(format !== 'png' && format !== 'jpg' && format !== 'jpeg' && format !== 'gif' && format !== 'webp' && format !== 'tiff'){
            res.status(400).send(JSON.stringify({'status': 'error', 'msg': `invalid format '${format}'`}))
            return;
        }
        let cacheDir = path.join(__dirname, 'cache')
        if(!fs.existsSync(cacheDir)){
            fs.mkdirSync(cacheDir)
        }
        let fileName = md5(url + ':' + width + ':' + height + ':' + resize + ':' + gravity).toString() + '.' + format
        let filePath = path.join(__dirname, 'cache', fileName)
        if(fs.existsSync(filePath)){
            res.sendFile(filePath)
        }else{
            isImageURL(url).then(isValid => {
                if(isValid === true){
                    request.get(url, (err, _, body) => {
                        if(err){
                            res.status(400).send(JSON.stringify({'status': 'error', 'msg': 'invalid url'}))
                        }else{
                            try{
                                sharp(Buffer.from(body))
                                    .resize({
                                        width: width > 0 ? width : null,
                                        height: height > 0 ? height : null,
                                        fit: resize,
                                        gravity: gravity,
                                    })
                                    .toFile(filePath)
                                    .then(_ => {
                                        res.sendFile(filePath)
                                    }).catch(err2 => {
                                        console.log(err2)
                                        res.status(400).send(JSON.stringify({'status': 'error', 'msg': err2}))
                                    })
                            } catch(err3) {
                                console.log(err3)
                                res.status(400).send(JSON.stringify({'status': 'error', 'msg': err3}))
                            }
                        }      
                    })
                }else {
                    res.status(400).send(JSON.stringify({'status': 'error', 'msg': 'invalid url'}))
                }
            })
        }
    }
})

app.get('/clearcache/:key', (req, res) => {
    if(req.params.key === config.key){
        let cacheDir = path.join(__dirname, 'cache')
        rimraf(cacheDir, () => {
            fs.mkdirSync(cacheDir)
            res.send(JSON.stringify({'status': 'success'}))
        });
    }else{
        res.status(400).send(JSON.stringify({'status': 'error', 'msg': 'invalid key'}))
    }
})

app.listen(port, () => {
  console.log(`ImageResizer app listening at 127.0.0.1:${port}`)
})