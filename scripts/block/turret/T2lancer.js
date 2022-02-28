//
const lib = require('blib');
const items = require("game/items");

const chargeTime = 20;
const chargeMaxDelay = 15;
const chargeEffects = 5;
const chargeEffect = Fx.lancerLaserCharge;
const chargeSound = Sounds.none;
const chargeBeginEffect = lib.newEffect(chargeTime * 2, e => {
        Draw.color(Color.valueOf("ec7458aa"), Color.valueOf("5ef5ff"), Color.white);
        Fill.circle(e.x, e.y, e.fin() * 2.5);

        Draw.color();
        Fill.circle(e.x, e.y, e.fin() * 1.5);
});
const eff1 = lib.newEffect(10, (e) => {
        Draw.color(Color.white, Color.valueOf("00faff"), e.fin());
        Lines.stroke(e.fout() * 2 + 0.2);
        Lines.circle(e.x, e.y, e.fin() * 28);
});
const laser = extend(LaserBulletType, {});
laser.damage = 120;
laser.sideAngle = 1;
laser.sideWidth = 3;
laser.sideLength = 35;
laser.collidesAir = false
laser.length = 190;
laser.hitSize = 4;
laser.lifetime = 16;
laser.drawSize = 400;
laser.lightningSpacing = 35;
laser.lightningLength = 2;
laser.lightningDelay = 1.1;
laser.lightningLengthRand = 10;
laser.lightningDamage = 1;
laser.lightningAngleRand = 30;
laser.lightColor = Pal.lancerLaser;
laser.lightningColor = Pal.lancerLaser;
laser.shootEffect = eff1;


const T2lan = extendContent(PowerTurret, 'T2-lancer', {});

T2lan.buildType = prov(()=>{
var _shotCounter = 0;

const block = T2lan;
var x = 0, y = 0;
var rotation = 0;

return new JavaAdapter(PowerTurret.PowerTurretBuild, {
    shoot(type){
        x = this.x;
        y = this.y;
        rotation = this.rotation;
        this.super$shoot(type);
        var i = (_shotCounter % block.shots) - (block.shots - 1)/2;
        var vec = new Vec2();
        vec.trns(rotation - 90, -(block.spread * i + Mathf.range(0)), block.size * 8 / 2);
        chargeBeginEffect.at(x + vec.x, y + vec.y, rotation);
        chargeSound.at(x + vec.x, y + vec.y, 1);
            
        for(var i = 0; i < chargeEffects; i++){
            Time.run(Mathf.random(chargeMaxDelay), () => {
                if(!this.isValid()) return;
                chargeEffect.at(x + vec.x, y + vec.y, rotation);
            });
        }
        _shotCounter ++;
    }
}, T2lan);});
T2lan.powerUse = 11;
T2lan.shootType = laser;
T2lan.spread = 3;
T2lan.shots = 2;
T2lan.shootShake = 2;
T2lan.alternate = true;
T2lan.reloadTime = chargeTime * 2;
T2lan.restitution = 0.02;
T2lan.range = 180;
T2lan.shootCone = 15;
T2lan.ammoUseEffect = Fx.none;
T2lan.health = 1500;
T2lan.inaccuracy = 0;
T2lan.rotateSpeed = 10;
T2lan.size = 2;
T2lan.targetAir = false;
T2lan.shootSound = Sounds.laser;
T2lan.requirements = ItemStack.with(
    Items.copper, 120,
    Items.lead, 120,
    Items.silicon, 80,
    Items.titanium, 80,
    items.crispSteel, 40
);
T2lan.buildVisibility = BuildVisibility.shown;
T2lan.category = Category.turret;

exports.T2lan = T2lan;
