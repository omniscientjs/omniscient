var images = [
  'http://forestwonderz.com/wp-content/uploads/2014/06/Funny-Cat-Pictures-cats-935656_500_375.jpg',
  'http://impfashion.com/wp-content/uploads/2014/01/funny-photos-27.jpg',
  'http://jokideo.com/wp-content/uploads/2013/08/Funny-baby-I-came-out-of-your-what.png',
  'http://www.picshunger.com/wp-content/uploads/2014/04/1512262_pee_jpegfe9341b7ea1c04f46f798046c10610ec.jpg',
  'http://www.funnfun.in/wp-content/uploads/2012/10/rehman-malik-funny-childhood.jpg',
  'http://i218.photobucket.com/albums/cc220/starr5505/Funny%20Cat%20Pics/funny-pictures-of-cats-dot-info-341.jpg',
  'http://www.funnycatsite.com/pictures/Jazz_Hands_Cat.jpg',
  'http://www.somepets.com/wp-content/uploads/2013/09/funny-cat11.jpg',
  'http://www.skunkwire.com/wp-content/uploads/2013/11/come-at-me-bro.jpg',
  'http://2nerd.com/wp-content/uploads/2012/07/Come-At-me-Bro.jpg',
  'http://www.quickmeme.com/img/e0/e09a9cb80e3e3087d1a84b6762a5f475e5404b6d915185e7da6775ec8cc63210.jpg'
];


module.exports = function getRandomImage () {
  return images[Math.floor(Math.random()*images.length)];
};
