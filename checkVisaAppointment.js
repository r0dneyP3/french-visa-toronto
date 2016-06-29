import request from 'request';
import { parseString } from 'xml2js';
import moment from 'moment';

const desiredRange = [moment('2016-07-05'), moment('2016-08-15')];

const getCookie = (callback)=>{
  console.log('Getting new cookie!');
  request(
    {
      url:'https://pastel.diplomatie.gouv.fr/rdvinternet/html-3.04.03/frameset/frameset.html?lcid=1&sgid=296&suid=5',
      jar:true
    }, ()=>{
    request(
      {
        url:'https://pastel.diplomatie.gouv.fr/rdvinternet/flux/protected/RDV/prise/prendreRDVCg.xml?lcid=1&sgid=296&suid=5',
        jar:true
      }, (err, response, body)=>{
        callback && callback();
      });
    }
  );
};

const checkForAvailableSlots = ()=>{
  console.log('Checking At ' +  moment().format('dddd, MMM D, h:mm a'));
  request(
    {
      url:'https://pastel.diplomatie.gouv.fr/rdvinternet/flux/protected/RDV/prise/horaires.xml',
      jar:true
    }, 
    (err, res, body)=>{
      parseString(body, (err,result)=>{
        if (result.PAGE.SESSION[0].STATUT[0] !== 'OK') {
          console.log('Cookie expired');
          getCookie();
        }
        let twoTimeSets = result.PAGE.HORAIRES[0].HO.slice(0,2);
        let firstSlot = moment(twoTimeSets[0].D[0] + twoTimeSets[0].H[0], 'DDMMYYYYHH:mm');
        let secondSlot = moment(twoTimeSets[1].D[0] + twoTimeSets[1].H[0], 'DDMMYYYYHH:mm');
        if (firstSlot.isSame(secondSlot, 'day') &&
            firstSlot.isAfter(desiredRange[0]) &&
            firstSlot.isBefore(desiredRange[1])
            ){
          console.log('First Slot: ' + firstSlot.format('dddd, MMM D, h:mm a'));
          console.log('Second Slot: ' + secondSlot.format('dddd, MMM D, h:mm a'));
          console.log('===============================');
        }
      });
    }
  );
}
getCookie(checkForAvailableSlots);
setInterval(checkForAvailableSlots, 1000*60);

