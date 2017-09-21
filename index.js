const axios = require('axios');

const baseUrl = 'https://test.melamenu.com/api/'
const bearer = '208987bece52f89668a4f04b0ce54cef'

//const baseUrl = 'http://localhost:3000/v1/'
//const bearer = 'f3d2fafc7c8d7f9f0081dfdbf87aec43'

const approveOffer = (offer, orderHash) => {
  axios({
    method: 'put',
    url: baseUrl + `offers/${offer.id}`,
    data: {
      "hash": orderHash
    }
  }).then((response) => {
    checkoutOffer(offer)
  }).catch((err) => {
    console.error(err.response.data)
    process.exit(0)
  });
}

const addOffer = (order) => {
  axios({
    method: 'post',
    url: baseUrl + 'offers',
    headers: {
      Authorization: `Bearer ${bearer}`
    },
    data: {
      "amount": 10000,
      "comment": "Вкусно!",
      "delivery_time": "01:30",
      "order_hash": order.hash,
      "order_id": order.id
    }
  }).then((response) => {
    const offer = response.data.data[0]
    console.log(`offer added ${offer.id}`)
    if (order.payment_method === 'card') {
      addCardToOffer(offer.id, () => {
        console.log('card added')
        approveOffer(offer, order.hash)
      })
    } else {
      approveOffer(offer, order.hash)
    }
  }).catch((err) => {
    console.error('offer error');
    console.error(err.response.data)
    process.exit(0)
  });
}

const addCardToOffer = (offerId, callback) => {
  axios({
    method: 'post',
    url: baseUrl + 'cards',
    data: {
      cryptogram: '014111111111220102G8/eKWCPY/3PKiAfwrU8xLo9jhTCmlZDommRPoJji8ip4GgyxwNIhtD5sCZ6SEEjwakd7Nvgo00VBugdFjpskE2QX/GG6651ER75zyX6JpxOoQ0qMpIVeFuj8wmfpCreneETX6B61EOURfes7H4SgPxFl/sPQ2I1+UM2bqFhB1t7kXuP8/fklldzB7V/iWlI5Qk3+dAHlOEWO2rCWtfVBXlyYfzZzW7RQtO3fDmTDfF1+xT5qNwWmFYcPxm3Tp/Ly2F9qrMUEUTADN1gnw5w2qg5+0gxmeE3zSNqVYU30membjSMtnQNvcb7/XfZfH3W0G7aTTRkKY5ZGuGeRN8hRQ==',
      name: 'TEST NAME',
      offer_id: offerId
    }
  }).then((response) => {
    const card = response.data.data[0]
    callback(card)
  }).catch((err) => {
    console.log(err.response.data)
    process.exit(0)
  })
}

const addOrder = (callback) => {
  axios({
    method: 'post',
    url: baseUrl + 'orders',
    data: {
      "comment": "Test 123123123",
      "push_token": "876asd7a87as8710239871237a7s6dd",
      "client_address": "улица Академика Пилюгина 44",
      "city_id": 1,
      "payment_method": "card",
      "client_order": [{"id": 1, "count": 1}]
    }
  }).then((response) => {
    const order = response.data.data[0]
    console.log(`order added ${order.id}`)
    if (callback) {
      addOffer(order)
    }
  }).catch((err) => {
    console.log(err.response.data)
    process.exit(0)
  })
}

const checkoutOffer = (offer) => {
  axios({
    method: 'post',
    url: baseUrl + 'checkout/' + offer.id,
    data: {
      "pin_code": offer.pin_code
    }
  }).then((response) => {
    console.log(`offer checked out ${offer.id}`)
    process.exit(0)
  }).catch((err) => {
    console.error('checkout error')
    console.error(err.response.data)
    process.exit(0)
  })

}

try {
  addOrder(addOffer)
} catch (err) {
  console.log(err)
}

