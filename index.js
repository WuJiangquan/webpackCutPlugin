
const fs = require("fs");
const _ = require('lodash');
const path = require('path');



class WebpackCopyPlugin {
  constructor(options) {
    //需要传入的WebPack项目ID
    if(!options.test){
       throw new Error("you have to config the 'test' option");
    }
    this.options = _.extend({
        test : "",
        to :"",
        assetsRoot : ""
    }, options);
  }
  apply(compiler) {
    let afterEmit = (compilation, callback) => {
      const self = this;
      for(var assetPath in compilation.assets){
          let asset = compilation. assets[assetPath];
          var matchres = matchPath(this.options.test,asset.existsAt,this.options.assetsRoot);
          if(matchres){
            copyFile(asset.existsAt,path.join(this.options.to,matchres));
          }
      }
      callback();
    }
    let emit = (compilation, callback)=>{
      callback();
    }
    let make = (compilation, callback)=>{
      callback();
    }
    if (compiler.hooks) {
      var plugin = {
        name: 'FileChanges'
      }
      compiler.hooks.afterEmit.tapAsync(plugin, afterEmit)
      compiler.hooks.emit.tapAsync(plugin, emit)
      compiler.hooks.make.tapAsync(plugin,make)
      compiler.hooks.done.tapAsync(plugin, (compilation, callback) => {
        callback();
      });
    } else {
      compiler.plugin("after-emit",afterEmit)
      compiler.plugin("emit",emit)
      compiler.plugin("make",make)
    }
  }
}

var matchPath = function(pathPattern,path,root){
  var relativePath = path.replace(root,"");
  if(pathPattern.test(relativePath)){
       return relativePath;
  }
   return false;
}

var copyFile  = function(filePath,targetPath){
  // fs.renameSync(filePath,targetPath)
  let folderPath = targetPath.replace(/(?<=\/)(\w*\-*)*\.json$/,"");
  try {
    fs.accessSync(folderPath);
  } catch (e) {
    createFolder(folderPath);
  }
  fs.copyFileSync(filePath,targetPath);
  // const writeStream = fs.createWriteStream(folderPath)
  // fs.createReadStream(filePath).pipe(writeStream);
}

var createFolder = function(folderPath){
  var parentFoleder = folderPath.replace(/(?<=\/)(\w*\-*\.*)*(?:(\/$|$))/,"");
  try {
    fs.accessSync(parentFoleder);
  } catch (e) {
    createFolder(parentFoleder);
  }
  fs.mkdirSync(folderPath);
}


module.exports = WebpackCopyPlugin;