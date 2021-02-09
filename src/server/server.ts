import { generateConnectionPool, pool } from './db/db';
import { RifleAmmo } from './config';

generateConnectionPool();

let ESX;

emit('esx:getSharedObject', obj => (ESX = obj));

ESX.RegisterServerCallback('inventory:server:getPlayerInventory', (source, cb, target) => {
  const targetPlayer = ESX.GetPlayerFromId(target);
  if (target != null) {
    cb({
      inventory: targetPlayer.inventory,
      money: targetPlayer.getMoney(),
      weapons: targetPlayer.loadout,
    });
  } else {
    cb(null);
  }
});

const queryAllWeapons = async () => {
  const query = "SELECT * FROM items WHERE LCASE(name) LIKE '%weapon_%'";
  const [results] = await pool.query(query, []);
  const weapons = JSON.parse(JSON.stringify(results));
  for (const weapon of weapons) {
    ESX.RegisterUsableItem(weapon['name'], source => {
      emitNet('inventory:client:useWeapon', source, weapon['name']);
    });
  }
};

ESX.RegisterServerCallback('inventory:server:getAmmo', async (source, cb, hash) => {
  const player = ESX.GetPlayerFromId(source);
  const query = `SELECT * FROM disc_ammo WHERE owner = '${player.identifier}' AND hash = '${hash}'`;
  const [results] = await pool.query(query, []);
  const weapons = JSON.parse(JSON.stringify(results));
  if (weapons instanceof Array) {
    if (weapons[0].count >= 0) {
      cb(weapons[0].count);
    } else {
      cb(null);
    }
  }
});

onNet('inventory:server:updateAmmo', async (hash, ammo) => {
  const player = ESX.GetPlayerFromId(source);
  const query = `UPDATE disc_ammo SET count = '${ammo}' WHERE hash = '${hash}' AND owner = '${player.identifier}'`;
  const [results] = await pool.query(query, []);
  const weapons = JSON.parse(JSON.stringify(results));
  if (weapons['affectedRows'] === 0) {
    const query2 = `INSERT INTO disc_ammo(owner, hash, count) VALUES ('${player.identifier}', '${hash}', '${ammo}')`;
    const [results2] = await pool.query(query2, []);
  }
});

const RegisterAmmo = () => {
  for (let i = 0; i < RifleAmmo.weapons.length; i++) {
    ESX.RegisterUsableItem(RifleAmmo.name, source => {
      TriggerClientEvent('inventory:client:useAmmo', source, RifleAmmo.weapons[i], RifleAmmo.count);
      const player = ESX.GetPlayerFromId(source);
      player.removeInventoryItem(RifleAmmo.name, 1);
    });
  }
};

queryAllWeapons();
RegisterAmmo();
