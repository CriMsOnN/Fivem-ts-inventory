import { Items, InventoryItems } from '../interface/Items';
import { ESX } from '../client';
import { Delay } from '../../util';
import { ItemWeights } from '../functions/weight';
export class Inventory {
  private items: Items[] = [];
  private inventory: InventoryItems[] = [];
  private money: number;
  private weapons: InventoryItems[] = [];
  private weight = 0;
  private static instance: Inventory;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  static getInstance(): any {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new Inventory();
    return this.instance;
  }

  load = (): void => {
    ESX.TriggerServerCallback(
      'inventory:server:getPlayerInventory',
      data => {
        this.items = [];
        this.inventory = data.inventory;
        this.money = data.money;
        this.weapons = data.weapons;
        if (this.inventory != null) {
          for (let i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i].count <= 0) {
              this.inventory[i] = null;
            } else {
              this.inventory[i].type = 'item_standard';
              this.inventory[i].weight = Math.round(
                (ItemWeights[this.inventory[i].name] * this.inventory[i].count) / 10,
              );
              this.weight = this.weight + this.inventory[i].weight;
              this.items.push(this.inventory[i]);
            }
          }
        }
        if (this.weapons != null) {
          for (let i = 0; i < this.weapons.length; i++) {
            const weaponHash = GetHashKey(this.weapons[i].name);
            const playerPed = PlayerPedId();
            if (
              HasPedGotWeapon(playerPed, weaponHash, false) &&
              this.weapons[i].name != 'WEAPON_UNARMED'
            ) {
              const ammo = GetAmmoInPedWeapon(playerPed, weaponHash);
              this.weapons[i].weight = ItemWeights[this.weapons[i].name];
              this.weight = this.weight + this.weapons[i].weight;
              this.items.push({
                label: this.weapons[i].label,
                count: ammo,
                limit: -1,
                type: 'item_weapon',
                name: this.weapons[i].name,
                usable: false,
                rare: false,
                canRemove: false,
                durability: 100,
                weight: this.weapons[i].weight,
              });
            }
          }
        }

        this.sendNui();
      },
      GetPlayerServerId(PlayerId()),
    );
  };

  sendNui = (): void => {
    SendNuiMessage(
      JSON.stringify({
        action: 'show',
        items: this.items,
        money: this.money,
      }),
    );
    SetNuiFocus(true, true);
  };

  getWeight = (): number => {
    return this.weight;
  };
}
