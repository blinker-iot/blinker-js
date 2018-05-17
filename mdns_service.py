import sys
from zeroconf import ServiceInfo, Zeroconf

import uuid
# import json
import time
import socket

# os_time_start = time.time()

# def check_json_format(raw_msg):
#     if isinstance(raw_msg, str):
#         if raw_msg[0] == '{':
#             try:
#                 json.loads(raw_msg, encoding='utf-8')
#             except ValueError:
#                 return False
#             return True
#         else:
#             return False
#     else:
#         return False

# def json_encode(key, value):
#     data = {}
#     data[key] = value
#     data = json.dumps(data)
#     return data

# def millis():
#     ms = (time.time() - os_time_start) * 1000
#     return int(ms)

# def now():
#     return time.strftime("%H:%M:%S %Y", time.localtime())

# def macAddress():
#     return (':'.join(['{:02X}'.format((uuid.getnode() >> ele) & 0xff)
#         for ele in range(0,8*6,8)][::-1]))

def macDeviceName():
    return (''.join(['{:02X}'.format((uuid.getnode() >> ele) & 0xff)
        for ele in range(0,8*6,8)][::-1]))

def localIP():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    finally:
        s.close()

    return ip

deviceName = macDeviceName()
deviceIP = localIP()
# wsPort = 81

def mDNSinit(type, port):
    deviceType = '_' + type
    wsPort = port
    desc = {'deviceType': deviceType}

    info = ServiceInfo(deviceType + "._tcp.local.",
                       deviceName + "." + deviceType +"._tcp.local.",
                       socket.inet_aton(deviceIP), wsPort, 0, 0,
                       desc, deviceName + ".local.")

    zeroconf = Zeroconf()
    zeroconf.register_service(info)

    print('mDNS responder init!')

get_type = sys.argv[1]
get_port = int(sys.argv[2])
mDNSinit(get_type, get_port)
