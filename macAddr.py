import uuid

def macDeviceName():
    return (''.join(['{:02X}'.format((uuid.getnode() >> ele) & 0xff)
        for ele in range(0,8*6,8)][::-1]))

deviceName = macDeviceName()

print(deviceName)