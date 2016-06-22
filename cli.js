#!/usr/bin/env node
'use strict';
const open = require('open');
const got = require('got');
const meow = require('meow');
const cheerio = require('cheerio');

const cli = meow(`
  npmsearch <query>: to search and automatically open all results on seperate tabs in your browser.
  `, {
    alias: {
      'v': 'version',
      'h': 'help'
    }
});

let input = cli.input.join(' ');

// if there is no passed in arg, abort
if (input.length < 1) {
  throw new Error(`
    You must have a search query in order to get results. Try the following
    npmsearch <query>
  `);
}

const uri = `https://www.npmjs.com/search?q=${ input }`;

got(uri)
  .then(res => {
    let $ = cheerio.load( res.body );
    let result = $('a.name');

    if (result.length < 1) {
      console.log(`
  You might want to use another query. This one is returning an empty result.
      `);
    }

    let attribs = Object.keys(result).map( (idx) => {
      return result[idx].attribs;
    });

    let hrefs = [];

    // filter out junk data then push to hrefs
    attribs.forEach( attr => {
      if ( attr ) {
        hrefs.push(attr.href);
      }
    });

    // automatically open the files
    hrefs.forEach( href => {
      open(`https://www.npmjs.com${ href }`);
    })
  }).catch(err => {
    throw new Error(err);
  })
