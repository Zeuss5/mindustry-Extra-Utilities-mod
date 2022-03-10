//引用部分，类似import，对应的是exports导出
const myitems = require("game/items");
const range = 36;
//火花攻击敌方范围
const enemyRange = 15*8;
//输出电量
const pullPower = 24*60;
//根本没用到.jpg
const effectChance = 0.005;

//开始工作前那个圆
/*drawer*/function circlePercent(x, y, rad, percent, angle){
    //if(p < 0.001) return;
    var p = Mathf.clamp(percent);
    var sides = Lines.circleVertices(rad);
    var space = 360 / sides;
    var len = 2 * rad * Mathf.sinDeg(space / 2);
    var hstep = Lines.getStroke() / 2 / Mathf.cosDeg(space / 2);
    var r1 = rad - hstep;
    var r2 = rad + hstep;
    var i;
    for(i = 0; i < sides * p - 1; ++i){
        var a = space * i + angle;
        var cos = Mathf.cosDeg(a);
        var sin = Mathf.sinDeg(a);
        var cos2 = Mathf.cosDeg(a + space);
        var sin2 = Mathf.sinDeg(a + space);
        Fill.quad(x + r1 * cos, y + r1 * sin, x + r1 * cos2, y + r1 * sin2, x + r2 * cos2, y + r2 * sin2, x + r2 * cos, y + r2 * sin);
    }
    var a = space * i + angle;
    var cos = Mathf.cosDeg(a);
    var sin = Mathf.sinDeg(a);
    var cos2 = Mathf.cosDeg(a + space);
    var sin2 = Mathf.sinDeg(a + space);
    var f = sides * p - i;
    var vec = new Vec2();
    vec.trns(a, 0, len * (f - 1));
    Fill.quad(x + r1 * cos, y + r1 * sin, x + r1 * cos2 + vec.x, y + r1 * sin2 + vec.y, x + r2 * cos2 + vec.x, y + r2 * sin2 + vec.y, x + r2 * cos, y + r2 * sin);
}
exports.circlePercent = circlePercent;
const Start = new Effect(30, cons(e => {
    Draw.color(myitems.lightninAlloy.color);
    Lines.stroke(3 * e.fout());
    Lines.circle(e.x, e.y, range * e.fout());
}));
//peng的一声的那个子弹
const effectBullet = extend(BasicBulletType, {});
Object.assign(effectBullet, {
    collidesAir : true,
    lifetime : 6,
    speed : 1,
    splashDamageRadius : 56,
    instantDisappear : true,
    splashDamage : 10,
    hitShake : 3,
    lightningColor : myitems.lightninAlloy.color,
    lightningDamage : 3,
    lightning : 5,
    lightningLength : 12,
    hitSound : Sounds.release,
});
effectBullet.hitEffect = new Effect(60, cons(e => {
    Draw.color(myitems.lightninAlloy.color);
    Lines.stroke(e.fout() * 2);
    Lines.circle(e.x, e.y, 4 + e.finpow() * effectBullet.splashDamageRadius);
    Draw.color(myitems.lightninAlloy.color);
    for(var i = 0; i < 4; i++){
        Drawf.tri(e.x, e.y, 6, 36 * e.fout(), (i - e.fin()) * 90);
    }
    Draw.color();
    for(var i = 0; i < 4; i++){
        Drawf.tri(e.x, e.y, 3, 16 * e.fout(), (i - e.fin()) * 90);
    }
}));

//火花子弹部分
const tailEffect = new Effect(12, cons(e => {
        Draw.color(myitems.lightninAlloy.color);
        Drawf.tri(e.x, e.y, 4 * e.fout(), 11, e.rotation);
        Drawf.tri(e.x, e.y, 4 * e.fout(), 15 * Math.min(1, e.data.time / 8 * 0.8 + 0.2), e.rotation - 180);
}));
//const defData = {target : null};
const effectBullet2 = extend(BulletType, {
    update(b){
        //var data = b.data == null ? defData : b.data;
        if(b.time > 18){
            var target = Units.closestTarget(b.team, b.owner.x, b.owner.y, enemyRange,
                boolf(e => (e.isGrounded() && this.collidesGround) || (e.isFlying() && this.collidesAir)),
                boolf(t => this.collidesGround)
            );
            var targetTo = target != null ? target : b.owner;
            var homingPower = target == null ? 0.08 : 0.5;
            if (targetTo != null) {
                b.vel.setAngle(Mathf.slerpDelta(b.rotation() + 0.01, b.angleTo(targetTo), homingPower));
            }
        }
        tailEffect.at(b.x, b.y, b.rotation(), {time : b.time});
    },
    draw(b){
        Draw.color(myitems.lightninAlloy.color);
        Drawf.tri(b.x, b.y, 4, 8, b.rotation());
        Draw.reset();
    },
});
Object.assign(effectBullet2, {
    damage : 22,
    speed : 4,
    lifetime : 120,
    hitEffect : Fx.none,
    despawnEffect : Fx.none,
});

const LG = extendContent(NuclearReactor, "lightnin-generator", {
    drawPlace(x, y, rotation, valid) {
        this.super$drawPlace(x, y, rotation, valid);
        Drawf.dashCircle(x * Vars.tilesize + this.offset, y * Vars.tilesize + this.offset, enemyRange, Pal.accent);
    },
});
LG.buildType = prov(() => {
    var working = false;
    var consumeTimer = 0;
    var light = 0;
    
    const block = LG;
    var items = null;
    var liquids = null;
    var x=0,y=0;
    
    return new JavaAdapter(NuclearReactor.NuclearReactorBuild, {
        updateTile(){
            //this.super$updateTile();
            items = this.items;
            liquids = this.liquids;
            x = this.x;
            y = this.y;
            if(items.total() == block.itemCapacity && !working){
                Start.at(this);
                Sounds.lasercharge2.at(x, y, 1.5);
                Units.nearby(null, x, y, range*2, cons(unit => {
                    unit.impulse(Tmp.v3.set(unit).sub(x, y).nor().scl(-pullPower));
                }));
                working = true;
            }
            if(items.total() < 1 && working){
                working = false;
                consumeTimer = 0;
            }
            var cliquid = block.consumes.get(ConsumeType.liquid);
            var item = block.consumes.getItem().items[0].item;

            var fuel = items.get(item);
            var fullness = fuel / block.itemCapacity;
            this.productionEfficiency = fullness;
            if(fuel > 0 && this.enabled && working){
                this.heat += fullness * block.heating * Math.min(this.delta(), 4);
                consumeTimer += this.getProgressIncrease(block.itemDuration);
                if(/*this.timer.get(this.block.timerFuel, this.block.itemDuration / this.timeScale)*/consumeTimer >= 1){
                    this.consume();
                    effectBullet.create(this, this.team, x + Mathf.range(block.size * 4), y + Mathf.range(block.size * 4), 0);
                    var random = Mathf.random(0, 360);
                    for(var i = 0; i < 3; i++){
                        effectBullet2.create(this, x, y, 120 * i + random);
                    }
                    consumeTimer %= 1;
                }
            }else{
                this.productionEfficiency = 0;
            }
            var liquid = cliquid.liquid;
            if(this.heat > 0){
                var maxUsed = Math.min(liquids.get(liquid), this.heat / block.coolantPower);
                this.heat -= maxUsed * block.coolantPower;
                this.liquids.remove(liquid, maxUsed);
            }
            if(this.heat > block.smokeThreshold){
                var smoke = 1 + (this.heat - block.smokeThreshold) / (1 - block.smokeThreshold); //ranges from 1.0 to 2.0
                if(Mathf.chance(smoke / 20 * this.delta())){
                    Fx.reactorsmoke.at(x + Mathf.range(block.size * Vars.tilesize / 2), y + Mathf.range(block.size * Vars.tilesize / 2));
                }
            }
            this.heat = Mathf.clamp(this.heat);
            if(this.heat >= 0.999){
                Events.fire(Trigger.thoriumReactorOverheat);
                this.kill();
            }
            light = Mathf.lerpDelta(light, working ? 1 : 0, 0.05);
        },
        draw(){
            this.super$draw();
            Draw.color(myitems.lightninAlloy.color);
            Draw.alpha(this.items.total() > 0 ? 1 : 0);
            Draw.z(Layer.effect);
            Lines.stroke(3);
            if(!working){
                circlePercent(this.x, this.y, range, this.items.total()/block.itemCapacity, 135);
            }
            Draw.alpha(light);
            Draw.rect(Core.atlas.find("btm-lightnin-generator-lights"), this.x,this.y);
        },
        drawSelect(){
            this.super$drawSelect();
            Drawf.dashCircle(x, y, enemyRange, Pal.accent);
        },
        write(write) {
            this.super$write(write);
            write.bool(working);
            write.f(consumeTimer);
            write.f(light);
        },
        read(read, revision) {
            this.super$read(read, revision);
            working = read.bool();
            consumeTimer = read.f();
            light = read.f();
        },
    }, LG);
});
Object.assign(LG, {
    size : 6,
    itemCapacity : 30,
    health : 2400,
    itemDuration : 186,
    powerProduction : 15900/60,
    hasItems : true,
    hasLiquids : true,
    heating : 0.04,
    explosionRadius : 88,
    explosionDamage : 6000,
    coolantPower : 0.1,
});
LG.consumes.item(myitems.lightninAlloy);
LG.liquidCapacity = 60;
LG.consumes.liquid(Liquids.cryofluid, 0.04 / 0.1).update = false;
LG.requirements = ItemStack.with(
    Items.lead, 800,
    Items.metaglass, 600,
    Items.graphite, 400,
    Items.silicon, 800,
    Items.surgeAlloy, 500,
    myitems.lightninAlloy, 300
);
LG.buildVisibility = BuildVisibility.shown;
LG.category = Category.power;
exports.LG = LG;
