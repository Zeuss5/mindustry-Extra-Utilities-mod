package ExtraUtilities.content;

import ExtraUtilities.worlds.entity.bullet.CtrlMissile;
import arc.graphics.Color;
import arc.graphics.g2d.Lines;
import arc.math.Interp;
import mindustry.Vars;
import mindustry.ai.types.BuilderAI;
import mindustry.content.Blocks;
import mindustry.content.Fx;
import mindustry.content.Items;
import mindustry.content.UnitTypes;
import mindustry.entities.Effect;
import mindustry.entities.effect.ExplosionEffect;
import mindustry.entities.effect.MultiEffect;
import mindustry.entities.effect.WaveEffect;
import mindustry.entities.effect.WrapEffect;
import mindustry.entities.part.FlarePart;
import mindustry.entities.part.ShapePart;
import mindustry.graphics.Drawf;
import mindustry.graphics.Layer;
import mindustry.graphics.Pal;
import mindustry.type.Category;
import mindustry.type.ItemStack;
import mindustry.type.StatusEffect;
import mindustry.type.UnitType;
import mindustry.world.Block;
import mindustry.world.blocks.defense.turrets.Turret;

import static arc.graphics.g2d.Draw.color;
import static arc.graphics.g2d.Lines.stroke;
import static mindustry.type.ItemStack.with;

public class EUOverride {
    public static void overrideBlockAll(){
        for(int i = 0; i < Vars.content.blocks().size; i ++){
            Block block = Vars.content.blocks().get(i);
            if(block instanceof Turret && block.size >= 5){
                boolean has = false;
                for(ItemStack stack : block.requirements){
                    if(stack.item == EUItems.lightninAlloy){
                        has = true;
                        break;
                    }
                }
                if(has) continue;
                ItemStack[] copy = new ItemStack[block.requirements.length + 1];
                System.arraycopy(block.requirements, 0, copy, 0, block.requirements.length);
                copy[block.requirements.length] = new ItemStack(EUItems.lightninAlloy, 50 + 50 * (block.size - 5));
                block.requirements = copy;
            }
        }
    }

    public static void overrideBlock1(){
        Blocks.arc.consumePower(2f);
        Blocks.smite.requirements(Category.turret, with(Items.oxide, 200, Items.surgeAlloy, 400, Items.silicon, 800, Items.carbide, 500, Items.phaseFabric, 300, EUItems.lightninAlloy, 120));
        ((Turret)Blocks.scathe).fogRadiusMultiuplier = 0.75f;
    }

    public static void overrideUnit1(){
        UnitTypes.quell.health = 6500;
        UnitTypes.quell.armor = 7;
        UnitTypes.quell.weapons.get(0).bullet = new CtrlMissile("quell-missile", -1, -1){{
            shootEffect = Fx.shootBig;
            smokeEffect = Fx.shootBigSmoke2;
            speed = 4.3f;
            keepVelocity = false;
            maxRange = 6f;
            lifetime = 60f * 1.6f;
            damage = 110;
            splashDamage = 110;
            splashDamageRadius = 25;
            buildingDamageMultiplier = 0.8f;
            hitEffect = despawnEffect = Fx.massiveExplosion;
            trailColor = Pal.sapBulletBack;
        }};
        UnitTypes.quell.weapons.get(0).shake = 1;

        UnitTypes.disrupt.weapons.get(0).bullet = new CtrlMissile("disrupt-missile", -1, -1){{
            shootEffect = Fx.sparkShoot;
            smokeEffect = Fx.shootSmokeTitan;
            hitColor = Pal.suppress;
            maxRange = 5f;
            speed = 4.6f;
            keepVelocity = false;
            homingDelay = 10f;
            trailColor = Pal.sapBulletBack;
            trailLength = 8;
            hitEffect = despawnEffect = new ExplosionEffect(){{
                lifetime = 50f;
                waveStroke = 5f;
                waveLife = 8f;
                waveColor = Color.white;
                sparkColor = smokeColor = Pal.suppress;
                waveRad = 40f;
                smokeSize = 4f;
                smokes = 7;
                smokeSizeBase = 0f;
                sparks = 10;
                sparkRad = 40f;
                sparkLen = 6f;
                sparkStroke = 2f;
            }};
            damage = 150;
            splashDamage = 150;
            splashDamageRadius = 25;
            buildingDamageMultiplier = 0.8f;

            parts.add(new ShapePart(){{
                layer = Layer.effect;
                circle = true;
                y = -3.5f;
                radius = 1.6f;
                color = Pal.suppress;
                colorTo = Color.white;
                progress = PartProgress.life.curve(Interp.pow5In);
            }});
        }};
        UnitTypes.disrupt.weapons.get(0).shake = 1f;

        UnitTypes.anthicus.weapons.get(0).bullet = new CtrlMissile("anthicus-missile", -1, -1){{
            shootEffect = new MultiEffect(Fx.shootBigColor, new Effect(9, e -> {
                color(Color.white, e.color, e.fin());
                stroke(0.7f + e.fout());
                Lines.square(e.x, e.y, e.fin() * 5f, e.rotation + 45f);

                Drawf.light(e.x, e.y, 23f, e.color, e.fout() * 0.7f);
            }), new WaveEffect(){{
                colorFrom = colorTo = Pal.techBlue;
                sizeTo = 15f;
                lifetime = 12f;
                strokeFrom = 3f;
            }});

            smokeEffect = Fx.shootBigSmoke2;
            speed = 3.7f;
            keepVelocity = false;
            inaccuracy = 2f;
            maxRange = 6;
            trailWidth = 2;
            trailColor = Pal.techBlue;
            low = true;
            absorbable = true;

            damage = 110;
            splashDamage = 110;
            splashDamageRadius = 25;
            buildingDamageMultiplier = 0.8f;

            despawnEffect = hitEffect = new MultiEffect(Fx.massiveExplosion, new WrapEffect(Fx.dynamicSpikes, Pal.techBlue, 24f), new WaveEffect(){{
                colorFrom = colorTo = Pal.techBlue;
                sizeTo = 40f;
                lifetime = 12f;
                strokeFrom = 4f;
            }});

            parts.add(new FlarePart(){{
                progress = PartProgress.life.slope().curve(Interp.pow2In);
                radius = 0f;
                radiusTo = 35f;
                stroke = 3f;
                rotation = 45f;
                y = -5f;
                followRotation = true;
            }});
        }};
        UnitTypes.anthicus.weapons.get(0).shake = 2;
        UnitTypes.anthicus.weapons.get(0).reload = 120;

        UnitTypes.tecta.weapons.get(0).bullet.damage = 0;
        UnitTypes.tecta.weapons.get(0).bullet.splashDamage = 95;
        UnitTypes.tecta.health = 9000;
    }

    public static void overrideBuilder(){
        for(int i = 0; i < Vars.content.units().size; i++){
            UnitType u = Vars.content.unit(i);
            if(u != null && u.buildSpeed > 0){
                StatusEffect s = Vars.content.statusEffect("new-horizon-scanner-down");
                if(s != null) u.immunities.add(s);
            }
        }
    }
}