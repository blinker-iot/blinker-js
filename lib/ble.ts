import ble from 'bleno';

function bleConfig() {
    var name = 'name';
    var serviceUuids = ['fffffffffffffffffffffffffffffff0']

    ble.startAdvertising(name, serviceUuids, (error) => {
        console.log(error);
    });
}

bleConfig();