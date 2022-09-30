function main(args) {
    let name = args.name || 'stranger'
    let greeting = 'Hello World! Nice to meet you' + name + '!' + 'This is a shared route.'
    console.log(greeting)
    return {"body": greeting}
  }
  