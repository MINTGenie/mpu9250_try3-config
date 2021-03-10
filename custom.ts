
//% color="#AA278D"
namespace orientbit {
    /**
     * Make sure your classes are exported
     */
    class mpu9250 {
        is_setup: boolean
        addr: number

        constructor(addr: number) {
            this.is_setup = false
            this.addr = addr
        }

        identify(): number {
            let result: number = smbus.readNumber(this.addr, 0x75, pins.sizeOf(NumberFormat.UInt8LE))
            return result
        }
        
        getRegAddr(regAddr: number): number {
            let result: number = smbus.readNumber(this.addr, regAddr, pins.sizeOf(NumberFormat.UInt8LE))
            return result
        }

        setup(): void {
            if (this.is_setup) return
            this.is_setup = true

            this.identify()
            
            smbus.writeByte(this.addr, 0x6B, 0x80)
            smbus.writeByte(this.addr, 0x6B, 0x0)
            smbus.writeByte(this.addr, 0x1B, 0x3 << 3)           
            smbus.writeByte(this.addr, 0x1A, 0x0 << 6)
            smbus.writeByte(this.addr, 0x6C, 0x00)
           /* smbus.writeByte(this.addr, 0x23, 0x70)
            smbus.writeByte(this.addr, 0x6A, 0x40)*/

        }


        light(): number {
            return this.raw()[0]
        }

        xyz(): number[] {
            let result: number[] = this.raw()
            /*for (let x: number = 0; x < result.length; x++) {
                result[x] = result[x] * 255
            }*/
            return result
        }

        raw(): number[] {
            this.setup()
            let result: Buffer = smbus.readBuffer(this.addr, 0x43, pins.sizeOf(NumberFormat.UInt16LE) * 3)
            return smbus.unpack("bbb", result)
        }
    };
    let _mpu9250: mpu9250 = new mpu9250(0x68)

    //% blockId=MINTGenieBit_get_regVal
    //% block="Get Reg Val at %regAddr"
    //% subcategory="Colour & Light"
    export function getVal(regAddr: number): number {
        return (_mpu9250.getRegAddr(regAddr))
    }

    //% blockId=MINTGenieBit_get_identity
    //% block="Get ident"
    //% subcategory="Colour & Light"
    export function getident(): number {
        return (_mpu9250.identify())
    }
    
    /**
     * Get the amount of red the colour sensor sees
     */
    //% blockId=MINTGenieBit_getGyroX
    //% block="Get GyroX"
    //% subcategory="Colour & Light"
    export function getGyroX(): number {
        return (_mpu9250.xyz()[0])
    }

    /**
     * Get the amount of green the colour sensor sees
     */
    //% blockId=MINTGenieBit_getGyroY
    //% block="Get GyroY"
    //% subcategory="Colour & Light"
    export function getGyroY(): number {
        return (_mpu9250.xyz()[1])
    }

    /**
     * Get the amount of blue the colour sensor sees
     */
    //% blockId=MINTGenieBit_get_GyroZ
    //% block="Get GyroZ"
    //% subcategory="Colour & Light"
    export function getGyroZ(): number {
        return (_mpu9250.xyz()[2])
    }


    class tcs34725 {
        is_setup: boolean
        addr: number
        leds: DigitalPin

        constructor(addr: number, leds: DigitalPin = DigitalPin.P1) {
            this.is_setup = false
            this.addr = addr
            this.leds = leds
        }

        setup(): void {
            if (this.is_setup) return
            this.is_setup = true
            smbus.writeByte(this.addr, 0x80, 0x03)
            smbus.writeByte(this.addr, 0x81, 0x2b)
        }

        setIntegrationTime(time: number): void {
            this.setup()
            time = Math.clamp(0, 255, time * 10 / 24)
            smbus.writeByte(this.addr, 0x81, 255 - time)
        }

        setLEDs(state: number): void {
            pins.digitalWritePin(this.leds, state)
        }

        light(): number {
            return this.raw()[0]
        }

        rgb(): number[] {
            let result: number[] = this.raw()
            let clear: number = result.shift()
            for (let x: number = 0; x < result.length; x++) {
                result[x] = result[x] * 255 / clear
            }
            return result
        }

        raw(): number[] {
            this.setup()
            let result: Buffer = smbus.readBuffer(this.addr, 0xb4, pins.sizeOf(NumberFormat.UInt16LE) * 4)
            return smbus.unpack("HHHH", result)
        }
    }
	let _tcs34725: tcs34725 = new tcs34725(0x29, DigitalPin.P1)

    //%
    export enum OnOff {
        Off = 0,
        On = 1
    }
    /**
     * Set the colour sensor LEDs
     */
    //% blockId=MINTGenieBit_set_leds
    //% block="Set LEDs to %state"
    //% subcategory="Colour & Light"
    export function setLEDs(state: OnOff): void {
        _tcs34725.setLEDs(state)
    }

    /**
     * Get the light level
     */
    //% blockId=MINTGenieBit_get_light_clear
    //% block="Get light"
    //% subcategory="Colour & Light"
    export function getLight(): number {
        return Math.round(_tcs34725.light())
    }

    /**
     * Get the amount of red the colour sensor sees
     */
    //% blockId=MINTGenieBit_get_light_red
    //% block="Get red"
    //% subcategory="Colour & Light"
    export function getRed(): number {
        return Math.round(_tcs34725.rgb()[0])
    }

    /**
     * Get the amount of green the colour sensor sees
     */
    //% blockId=MINTGenieBit_get_light_green
    //% block="Get green"
    //% subcategory="Colour & Light"
    export function getGreen(): number {
        return Math.round(_tcs34725.rgb()[1])
    }

    /**
     * Set the integration time of the colour sensor in ms
     */
    //% blockId=MINTGenieBit_set_integration_time
    //% block="Set colour integration time %time ms"
    //% time.min=0 time.max=612 value.defl=500
    //% subcategory="Expert"
    export function setColourIntegrationTime(time: number): void {
        return _tcs34725.setIntegrationTime(time)
    }

    /**
     * Get the amount of blue the colour sensor sees
     */
    //% blockId=MINTGenieBit_get_light_blue
    //% block="Get blue"
    //% subcategory="Colour & Light"
    export function getBlue(): number {
        return Math.round(_tcs34725.rgb()[2])
    }
}

namespace smbus {
    export function writeByte(addr: number, register: number, value: number): void {
        let temp = pins.createBuffer(2);
        temp[0] = register;
        temp[1] = value;
        pins.i2cWriteBuffer(addr, temp, false);
    }
    export function writeBuffer(addr: number, register: number, value: Buffer): void {
        let temp = pins.createBuffer(value.length + 1);
        temp[0] = register;
        for (let x = 0; x < value.length; x++) {
            temp[x + 1] = value[x];
        }
        pins.i2cWriteBuffer(addr, temp, false);
    }
    export function readBuffer(addr: number, register: number, len: number): Buffer {
        let temp = pins.createBuffer(1);
        temp[0] = register;
        pins.i2cWriteBuffer(addr, temp, true);
        return pins.i2cReadBuffer(addr, len, false);
    }
    export function readNumber(addr: number, register: number, fmt: NumberFormat = NumberFormat.UInt8LE): number {
        let temp = pins.createBuffer(1);
        temp[0] = register;
        pins.i2cWriteBuffer(addr, temp, true);
        return pins.i2cReadNumber(addr, fmt, false);
    }
    export function unpack(fmt: string, buf: Buffer): number[] {
        let le: boolean = true;
        let offset: number = 0;
        let result: number[] = [];
        let num_format: NumberFormat = 0;
        for (let c = 0; c < fmt.length; c++) {
            switch (fmt.charAt(c)) {
                case '<':
                    le = true;
                    continue;
                case '>':
                    le = false;
                    continue;
                case 'c':
                case 'B':
                    num_format = le ? NumberFormat.UInt8LE : NumberFormat.UInt8BE; break;
                case 'b':
                    num_format = le ? NumberFormat.Int8LE : NumberFormat.Int8BE; break;
                case 'H':
                    num_format = le ? NumberFormat.UInt16LE : NumberFormat.UInt16BE; break;
                case 'h':
                    num_format = le ? NumberFormat.Int16LE : NumberFormat.Int16BE; break;
            }
            result.push(buf.getNumber(num_format, offset));
            offset += pins.sizeOf(num_format);
        }
        return result;
    }
}