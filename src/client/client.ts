import { Delay } from '../util';
import { Inventory } from './classes/Inventory';
export let ESX;

const hotbar = [false, false, false, false, false];
let currentWeapon;
let currentWeaponSlot;
let canFire = true;

emit('esx:getSharedObject', obj => (ESX = obj));

setTick(() => {
  DisableControlAction(0, 37, true);
});

const inventory = Inventory.getInstance();

RegisterCommand(
  'opentrunk',
  function (source, args, raw) {
    inventory.openTrunk();
  },
  false,
);

RegisterCommand(
  'openinventory',
  function (source, args, raw) {
    inventory.load();
  },
  false,
);

RegisterCommand(
  '+hotbar1',
  function (source, args, raw) {
    if (hotbar[1] != false) {
      emitNet('esx:useItem', hotbar[1]);
    }
  },
  false,
);
RegisterCommand(
  '+hotbar2',
  function (source, args, raw) {
    if (hotbar[2] != false) {
      emitNet('esx:useItem', hotbar[2]);
    }
  },
  false,
);
RegisterCommand(
  '+hotbar3',
  function (source, args, raw) {
    if (hotbar[3] != false) {
      emitNet('esx:useItem', hotbar[3]);
    }
  },
  false,
);
RegisterCommand(
  '+hotbar4',
  function (source, args, raw) {
    if (hotbar[4] != false) {
      emitNet('esx:useItem', hotbar[4]);
    }
  },
  false,
);
RegisterCommand(
  '+hotbar5',
  function (source, args, raw) {
    if (hotbar[5] != false) {
      emitNet('esx:useItem', hotbar[5]);
    }
  },
  false,
);

RegisterCommand(
  'test',
  function (source, args, raw) {
    console.log(inventory.getWeight());
  },
  false,
);

RegisterKeyMapping('openinventory', 'Open Inventory', 'keyboard', 'tab');
RegisterKeyMapping('+hotbar1', 'HotBar1', 'keyboard', '1');
RegisterKeyMapping('+hotbar2', 'HotBar2', 'keyboard', '2');
RegisterKeyMapping('+hotbar3', 'HotBar3', 'keyboard', '3');
RegisterKeyMapping('+hotbar4', 'HotBar4', 'keyboard', '4');
RegisterKeyMapping('+hotbar5', 'HotBar5', 'keyboard', '5');
RegisterKeyMapping('+trunk', 'Open Trunk', 'keyboard', 'g');
RegisterNuiCallbackType('useItem');
RegisterNuiCallbackType('close');
RegisterNuiCallbackType('putIntoFast');
RegisterNuiCallbackType('putOutFromFast');

on('__cfx_nui:putOutFromFast', data => {
  hotbar[data.slot] = false;
});

on('__cfx_nui:putIntoFast', data => {
  if (hotbar[data.slot] != false) {
    hotbar[data.slot] = false;
  }

  hotbar[data.slot] = data.name;
});

on('__cfx_nui:close', data => {
  SetNuiFocus(false, false);
});

on('__cfx_nui:useItem', data => {
  emitNet('esx:useItem', data);
  inventory.load();
});

// Weapons
onNet('inventory:client:useWeapon', (weapon): void => {
  if (currentWeapon == weapon) {
    RemoveWeapon(currentWeapon);
    currentWeapon = null;
    currentWeaponSlot = null;
    return;
  } else if (currentWeapon != null) {
    RemoveWeapon(currentWeapon);
    currentWeapon = null;
    currentWeaponSlot = null;
  }

  currentWeapon = weapon;
  GiveWeapon(currentWeapon);
});

const RemoveWeapon = (weapon): void => {
  const playerPed = PlayerPedId();
  const hash = GetHashKey(weapon);
  const weaponAmmo = GetAmmoInPedWeapon(playerPed, hash);

  emitNet('inventory:server:updateAmmo', hash, weaponAmmo);
  canFire = false;
  RemoveWeaponFromPed(playerPed, hash);
  ClearPedTasks(playerPed);
  canFire = true;
};

const GiveWeapon = (weapon): void => {
  const playerPed = PlayerPedId();
  const hash = GetHashKey(weapon);
  ESX.TriggerServerCallback(
    'inventory:server:getAmmo',
    ammo => {
      GiveWeaponToPed(playerPed, hash, 1, false, true);
      SetPedAmmo(playerPed, hash, ammo || 0);
    },
    hash,
  );
};

onNet('inventory:client:useAmmo', async (ammo, count) => {
  const playerPed = GetPlayerPed(-1);
  let weapon;
  const [found, currentWeapon] = GetCurrentPedWeapon(playerPed, true);
  console.log(found, currentWeapon);
  if (found) {
    for (let i = 0; i < ammo.length; i++) {
      if (currentWeapon === GetHashKey(ammo)) {
        weapon = ammo;
      }
    }
  }
  if (weapon != null) {
    const pedAmmo = GetAmmoInPedWeapon(playerPed, weapon);
    const newAmmo = pedAmmo + count;
    ClearPedTasks(playerPed);
    const found = GetMaxAmmo(playerPed, weapon, count)[0];
    const maxAmmo = GetMaxAmmo(playerPed, weapon, count)[1];
    console.log(maxAmmo);
    if (newAmmo < maxAmmo) {
      await Delay(1000);
      SetPedAmmo(playerPed, weapon, newAmmo);
      TaskReloadWeapon(playerPed, false);
      emitNet('inventory:server:removeAmmo');
    }
  }
});

on('onResourceStop', resource => {
  if (GetCurrentResourceName() != resource) return;
  SetNuiFocus(false, false);
});
