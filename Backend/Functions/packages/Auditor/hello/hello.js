function main(args) {
    let name = args.name || 'stranger'
    let greeting = 'Hello World! Nice to meet you' + name + '!'
    console.log(greeting)
    return {"body": greeting}
  }
  