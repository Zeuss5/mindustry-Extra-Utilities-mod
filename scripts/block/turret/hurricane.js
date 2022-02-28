//
const lib = require('blib');
const items = require("game/items");
const liC = Color.valueOf("bf92f9");
const dec = Color.valueOf("ffffff");
const dec2 = Color.valueOf("ffffff");
const hur = extend(BasicBulletType, {
    update(b){
        if(b.timer.get(6)){
            for(var i = 0; i < 10; i++){
                var len = Mathf.random(1, 7);
                var a = b.rotation() + Mathf.range(this.fragCone/2) + this.fragAngle;
                Lightning.create(b.team, liC, 5, b.x - Angles.trnsx(a, len), b.y - Angles.trnsy(a, len), a, Mathf.random(2, 10));
                
            }
        }
    },
});
hur.width = 1;
hur.height = 1;
hur.damage = 26;
hur.lifetime = 60;
hur.speed = 3;
hur.status = StatusEffects.shocked;
hur.despawnEffect = lib.newEffect(20,(e) => {
	Draw.color(dec,dec2,e.fin());
	Lines.stroke(e.fout() * 3);
	Lines.circle(e.x, e.y, e.fin() * 60);
	Lines.stroke(e.fout() * 1.75);
	Lines.circle(e.x, e.y, e.fin() * 45);
	Draw.color(dec);
	Fill.circle(e.x, e.y, e.fout() * 20);
	Draw.color(dec,dec2,e.fin());
	Fill.circle(e.x, e.y, e.fout() * 14);
});
hur.pierceCap = 2
hur.pierceBuilding = true

const hurricane = extendContent(PowerTurret, 'hurricane', {});

lib.setBuildingSimple(hurricane, PowerTurret.PowerTurretBuild, {});
hurricane.powerUse = 8.5;
hurricane.shootType = hur;
hurricane.shots = 1;
hurricane.shootShake = 0.5;
hurricane.reloadTime = 60;
hurricane.restitution = 0.02;
hurricane.range = 160;
hurricane.shootCone = 15;
hurricane.ammoUseEffect = Fx.none;
hurricane.health = 1650;
hurricane.inaccuracy = 0;
hurricane.rotateSpeed = 10;
hurricane.size = 2;
hurricane.shootSound = Sounds.spark;
hurricane.requirements = ItemStack.with(
    Items.copper, 80,
    Items.lead, 80,
    Items.silicon, 50,
    //Items.graphite, 30,
    items.crispSteel, 20
);
hurricane.buildVisibility = BuildVisibility.shown;
hurricane.category = Category.turret;

exports.hurricane = hurricane;
