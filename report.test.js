const { sortPages, } = require('./report.js')

const { test, expect } = require('@jest/globals')

test('sortPages 2 pages', () => {
    const input = {
        'https://wagslane.dev/path': 2,
        'https://wagslane.dev': 40,
    } 
    const actual = sortPages(input)
    const expected = [
        [ 'https://wagslane.dev', 40 ],
        [ 'https://wagslane.dev/path', 2 ],
    ]
    
    expect(actual).toEqual(expected)
})

test('sortPages 5 pages', () => {
    const input = {
        'https://wagslane.dev/path5': 2,
        'https://wagslane.dev/path4': 5,
        'https://wagslane.dev/path2': 23,
        'https://wagslane.dev': 40,
        'https://wagslane.dev/path3': 8,
    } 
    const actual = sortPages(input)
    const expected = [
        [ 'https://wagslane.dev', 40 ],
        [ 'https://wagslane.dev/path2', 23 ],
        [ 'https://wagslane.dev/path3', 8 ],
        [ 'https://wagslane.dev/path4', 5 ],
        [ 'https://wagslane.dev/path5', 2 ],
    ]
    
    expect(actual).toEqual(expected)
})
