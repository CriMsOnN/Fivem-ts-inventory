let hotbar = [false, false, false, false, false, false];
let dragging = [];
let totalWeight = 0;
let MaxWeight = 100;

const Max_Inventory = 30;

$(() => {
  $('.container').hide();
  window.addEventListener('message', event => {
    const data = event.data;
    if (data.action == 'show') {
      setupItems(data.items);
      $('.container').fadeIn('slow');
    }
  });

  window.addEventListener('keydown', event => {
    if (event.keyCode == 27) {
      $.post('http://inventory/close', JSON.stringify({}));
      $('.container').hide();
    }
  });
});

setupItems = items => {
  $('.main-inventory').html('');
  let numberOfItems = 0;
  $("#main-weight-text").css("width", "0%");
  $("#main-weight-text").html("");
  totalWeight = 0;
  $.each(items, (key, value) => {
    if (value.weight !== undefined) {
      totalWeight = totalWeight + +value.weight;
    }
    let image;
    let hash = value.name;
    if (value.name.includes('WEAPON_')) {
      image = `${value.name}.svg`;
      value.name = value.name.split('_')[1];
    } else {
      image = `${value.name}.svg`;
    }

    const element = `
      <div class='item' data-id='${key + 1}' data-usable='${value.usable}' data-name='${
      value.name
    }' data-hash='${hash}' data-image='${image}' data-count='${value.count}'>
        <span id='item-image'>
          <img src='images/${image}'/>
        </span>
        <span id='item-durability'></span>
        <span id='item-name'>${value.name.toUpperCase()}</span>
        <span id='item-count'>${value.count}</span>
      </div>
    `;

    $('.main-inventory').append(element);
    numberOfItems = numberOfItems + 1;
  });
  if (totalWeight > 100) {
    totalWeight = 100
  } 
  if (totalWeight < 0) {
    totalWeight = 0
  }
  $("#main-weight-text").animate({
    width: totalWeight+'%'
  }, 2000, "linear", function() {
    $(this).html("<i class='fas fa-suitcase'></i>")
  })
  for (let i = numberOfItems; i < Max_Inventory - numberOfItems; i++) {
    const element = `
      <div class='item' data-id='${i}'>
          <span id='item-image'>
          </span>
          <span id='item-name'></span>
          <span id='item-count'></span>
        </div>
    `;
    $('.main-inventory').append(element);
  }

  for (let i = 1; i <= 6; i++) {
    if (hotbar[i] === false) {
      const element = 
      `
        <div class='hotbar-slot' data-id='${i}'>
        </div>
      `;
      $(".hotbar-container").append(element);
      hotbar[i] = true
    }
  }

  const element = document.querySelectorAll('#item-durability');
  element.forEach(elements => {
    elements.style.width = '100%';
  });
  startDraggable();
};

startDraggable = () => {
  const that = this;
  $('.item').draggable({
    helper: 'clone',
    append: 'body',
    revert: 'invalid',
    zIndex: 99999,
    revertDuration: 10,
    start: function (event, ui) {
      let usable = $(this).data('usable');
      $(this).css('opacity', 0.5);
      $(ui.helper).css('transform', 'scale(0.7)');
      if (usable) {
        $('.use').addClass('animate');
        $('.give').addClass('animate');
      } else {
        $('.use').addClass('disabled');
      }
    },
    stop: function (event, ui) {
      const usable = $(this).data('usable');
      $(this).css('opacity', 1);
      $('.use').removeClass('animate');
      $('.give').removeClass('animate');
      $('.use').removeClass('disabled');
    },
  });

  $('.use').droppable({
    drop: function (event, ui) {
      const usable = ui.draggable.data('usable');
      const name = ui.draggable.data('hash');

      if (usable) {
        fetch('http://inventory/useItem', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(name),
        });
      }
    },
  });

  $('.hotbar-slot').droppable({
    drop: function(event, ui) {
      const usable = ui.draggable.data('usable');
      const name = ui.draggable.data('name');
      const hash = ui.draggable.data('hash');
      const image = ui.draggable.data('image');
      const count = ui.draggable.data('count');
      const id = $(this).data('id');
      //if (usable) {
        const element = `
          <span id='hotbar-name' data-usable='${usable}' data-name='${name}' data-hash='${hash}' data-count='${count}' data-image='${image}'>${name}</span>
          <span id='hotbar-count'></span>
          <span id='hotbar-image'><img src='images/${hash}.svg'/></span>
        `;
        $(this).html(element);
        fetch('http://inventory/putIntoFast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slot: id,
            name: hash,
          })
        })
      }
    })
  $('.hotbar-slot').on('contextmenu', function(event) {
    $(this).html("");
    fetch('http://inventory/putOutFromFast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slot: $(this).data("id"),
          })
        })
  })
};
