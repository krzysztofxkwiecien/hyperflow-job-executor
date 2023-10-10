#!/usr/bin/env node

const express = require('express');
const app = express();
const redis = require('redis'),
    rcl = redis.createClient(process.env.REDIS_URL),
    handleJob = require('./handler').handleJob;

app.use(express.json())

app.post("/", (req, res) => {

    console.log("Received task with taskId [%s]", req.body.taskId);

    executeJob(req.body).then((value) => {
        console.log("Handling done")
        res.sendStatus(200);
    }).catch(function () {
        console.error("Handling error")
        res.sendStatus(500);
    });
})

async function executeJob(jobMessage) {
    let jobExitCode = await handleJob(jobMessage.taskId, rcl, jobMessage);
    console.log("Job", jobMessage.taskId, "job exit code:", jobExitCode);
}

app.listen(8080, () => {
    console.log(`Server listening on port 8080`);
});

rcl.on('ready', () => {
    console.log('Redis ready');
});

rcl.on('error', (err) => {
    console.error('Redis error:', err);
});