#import <Foundation/Foundation.h>

#define LOG_PREFIX         @"[10MCord]"
#define BunnyLog(fmt, ...) NSLog((LOG_PREFIX @" " fmt), ##__VA_ARGS__)