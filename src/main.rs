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
    let height = i / 4 / 500;
    let width  = i / 4 % 500;

    if i%4 == 3 {
      sl[i] = 255;
    } else if i%4 == 0 {
      let len = ((height*height + width*width) as f64).sqrt();
      let nb = time  + len / 4.0;
      let a = 128.0 + nb.cos() * 128.0;
      sl[i] = a as u8;

    } else if i %2 == 0 {
      let width = 500 - width;
      let len = ((height*height + width*width) as f64).sqrt();
      let nb = time  + len / 4.0;
      let a = 128.0 + nb.cos() * 128.0;
      sl[i] = a as u8;
    }
  }
}
