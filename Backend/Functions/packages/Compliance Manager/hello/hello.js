function main(args) {
    let name = args.name || 'stranger'
    let greeting = 'Hello World! Nice to meet you' + name + '!' + + 'This is a Compliance Manager route.'
    console.log(greeting)
    return {"body": greeting}
  }
  