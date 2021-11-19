require('dotenv').config()
const express = require('express');
const preview = require('link-preview-js')
const redis = require("redis");

// Configuration
const port = process.env.SERVICE_PORT ?? 3100

// Setup express server
const app = express();
const redisService = redis.createClient(process.env.REDIS_SERVICE);

// Setup router
app.get('/preview', async (req, res) => {
    const url = req.query.url

    redisService.get(url, async (error, value) => {
        try {
            if (value) {
                return res.json(JSON.parse(value))
            } else {
                const result = await preview.getLinkPreview(url)
                redisService.set(url, JSON.stringify(result), redis.print)
                return res.json(result)
            }
        } catch (e) {
            res.status(500)
        }
    })
});

// Start server
app.listen(port, () => {
    console.log(`App listening at ${port}`)
})
