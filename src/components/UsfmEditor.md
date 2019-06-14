Test component:

```js
const usfmString1 = `
\\id GEN
\\c 1
\\p
\\v 1 the first verse
\\v 2 the second verse
\\v 15 Tell the Israelites that I, 
the \\nd Lord\\nd*, the God of their 
ancestors, the God of Abraham, Isaac, 
and Jacob,
`;

const usfmString2 = `
\\id GEN
\\c 1
\\v 1 the first verse
\\v 2 the second verse
\\c 2
\\v 1 the first verse
\\v 2 the second verse
`;

const usfmString3 = `
\\id JHN
\\c 1
\\s1 The Preaching of John the 
Baptist
\\r (Matthew 3.1-12; Luke 3.1-18; 
John 1.19-28)
\\p
\\v 1 This is the Good News about 
Jesus Christ, the Son of God.
\\v 2 It began as the prophet 
Isaiah had written:
\\q1 “God said, ‘I will send my 
messenger ahead of you
\\q2 to open the way for you.’
\\q1
\\v 3 Someone is shouting in 
the desert,
\\q2 ‘Get the road ready for 
the Lord;
\\q2 make a straight path for 
him to travel!’”
\\p
\\v 4 So John appeared in the 
desert, baptizing and preaching. 
“Turn away from your sins and 
be baptized,” he told the people, 
“and God will forgive your sins.”
`;

const usfmNestedTags = `
 \\id GEN
 \\c 1
 \\p
 \\v 1 the first verse
 \\v 2 the second verse
 \\v 14 That is why \\bk The Book of 
 the \\+nd Lord\\+nd*'s Battles\\bk* 
 speaks of “...the town of Waheb in 
 the area of Suphah
 `;

const usfmString = usfmNestedTags;

(
    <div>
        <UsfmEditor usfmString={usfmString} />
        <pre>{usfmString}</pre>
    </div>
);
```
