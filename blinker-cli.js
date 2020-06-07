const { program } = require('commander');

program
    .option('--no-sauce', 'Remove sauce')
    .option('--cheese <flavour>', 'cheese flavour', 'mozzarella')
    .option('--no-cheese', 'plain with no cheese')


program
    .command('start <service>', 'start named service')
    .command('stop [service]', 'stop named service, or all if no name supplied')
    .parse(process.argv);


program.on('--help', () => {
    console.log('');
    console.log('Example call:');
    console.log('  $ custom-help --help');
});

// const sauceStr = program.sauce ? 'sauce' : 'no sauce';
// const cheeseStr = (program.cheese === false) ? 'no cheese' : `${program.cheese} cheese`;
// console.log(`You ordered a pizza with ${sauceStr} and ${cheeseStr}`);


function createConfig(){

}

function readConfig(){

}

function getMac() {
    
}