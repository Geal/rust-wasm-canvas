#![feature(allocator_api)]

use std::heap::{Alloc, Heap, Layout};
use std::mem;

use std::slice;
use std::iter::repeat;

fn main() {}

#[repr(C)]
#[derive(Clone)]
pub struct Pixel {
  pub red:     u8,
  pub green:   u8,
  pub blue:    u8,
  pub opacity: u8,
}

impl Pixel {
  pub fn new() -> Pixel {
    Pixel {
      red:     255,
      green:   0,
      blue:    0,
      opacity: 0
    }
  }
}

#[no_mangle]
pub extern "C" fn alloc(size: usize) -> *mut u8 {
  unsafe {
    let layout = Layout::from_size_align(size, mem::align_of::<u8>()).unwrap();
    Heap.alloc(layout).unwrap()
  }
}

#[no_mangle]
pub extern "C" fn dealloc(ptr: *mut u8, size: usize) {
  unsafe  {
    let layout = Layout::from_size_align(size, mem::align_of::<u8>()).unwrap();
    Heap.dealloc(ptr, layout);
  }
}

#[no_mangle]
pub fn fill(pointer: *mut u8, length: usize, time: f64) {
  let mut sl = unsafe { slice::from_raw_parts_mut(pointer, length * 4) };

  for i in 0..length*4 {
    if i%4 == 3 {
      sl[i] = 255;
    } else if i%4 == 0 {
      //sl[i] = 255;

      //let nb = ((i % 4) as f64) * (time + (i as f64));
      let height = (i-i%4) / 50;
      let width  = (i-i%4) % 50;
      let len = ((height*height + width*width) as f64).sqrt();
      /*let nb = time + len;
      //sl[i] = (nb.cos() * 255.0) as u8;
      sl[i] = (nb  255.0) as u8;
      */

      let nb = (time + len) as usize;
      //sl[i] = (nb.cos() * 255.0) as u8;
      sl[i] = (nb % 256) as u8;
    }
  }
}
