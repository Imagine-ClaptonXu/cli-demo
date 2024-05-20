#!/usr/bin/env node


import path from 'node:path'
import fs from 'node:fs'
import {
    argv,
} from 'node:process'
import {
    exec,
} from 'node:child_process'


const log = console.log.bind(console)

const initVue = function (name) {
    // 执行新建 vue 项目命令，默认模版，跳过提示
    let command = `npm create vue@latest ${name} -- --default`
    log('### 执行命令：')
    log(command)
    const child = exec(command, { stdio: 'inherit' });
    child.stdout.on('data', function(data) {
        console.log(data.toString('utf-8'))
    })
    child.stderr.on('data', function(error) {
        console.log('error', error.toString('utf-8'))
    })
    child.on('exit', function(code) {
        console.log('close', code)
        addDockerFile(name)
    })

    // process.stdin.on('data', function(data) {
    //     log('### user input from stdin:', data)
    //     let s = data.toString('utf-8')
    //     log('### user input from stdin utf-8:', s)
    // })
}

const addFile = function (filePath, fileName, fileDetail) {
    let checkFileExist = fs.existsSync(path.join(filePath, fileName))
    if (checkFileExist) {
        console.log(`### <${fileName}> 文件已存在`);
    } else {
        fs.writeFile(path.join(filePath, fileName), fileDetail, {}, (err) => {
            if (err) {
                return console.error(`!!! 新增文件 <${fileName}> 失败：`, err);
            }
            console.log(`### 新增文件 <${fileName}>`);
        });
    }
}

const addDockerFile = function (name='') {
    // 获取当前命令行所在路径
    // let cwdDir = process.cwd()
    // log('cwdDir', cwdDir)
    const __dirname = process.cwd()
    // log('currentPath', __dirname)
    let targetPath = path.join(__dirname, name)
    log(`### 当前路径 <${targetPath}>`)


    // 写入 .prettierrc.json
    let prettierrcJSON = `{
    "$schema": "https://json.schemastore.org/prettierrc",
    "semi": false,
    "tabWidth": 4,
    "singleQuote": true,
    "printWidth": 100,
    "trailingComma": "all",
    "endOfLine": "auto"
}
`
    addFile(targetPath, ".prettierrc.json", prettierrcJSON)


    // 写入 .node-version
    let nodeVersion = `nodejs 20.11.1`
    addFile(targetPath, ".node-version", nodeVersion)

    
    // 写入 .editorconfig
    let editorConfig = `root = true

    [*]
    charset = utf-8
    insert_final_newline = false
    indent_style = space
    indent_size = 4
`
    addFile(targetPath, ".editorconfig", editorConfig)

}

const __main = function () {
    // 获取命令行参数
    // log('x cli', process.argv) // xcli new=vue name=h5-xx
    let argsMapper = {}
    for (let arg of argv.slice(2)) {
        let [k, v] = arg.split('=')
        argsMapper[k] = v
    }
    log('### 输入参数：')
    log(argsMapper)

    let name = argsMapper.name || ''
    if (argsMapper.name && argsMapper.new === 'vue') {
        initVue(name)
    } else if (argsMapper.new === 'config') {
        addDockerFile()
    }
}

__main()
