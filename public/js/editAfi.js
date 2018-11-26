let val = document.getElementsByClassName('afi');

for (let i = 0; i < val.length; i++) {
    let e = val[i];

    let s = e.textContent;

    let sNew = s.slice(0, 5);

    console.log(sNew);

    e.textContent = sNew;
}