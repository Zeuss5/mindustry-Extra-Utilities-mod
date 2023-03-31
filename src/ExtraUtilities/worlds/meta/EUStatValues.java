package ExtraUtilities.worlds.meta;

import arc.Core;
import arc.func.Boolf;
import arc.graphics.Color;
import arc.graphics.g2d.TextureRegion;
import arc.math.Mathf;
import arc.scene.style.TextureRegionDrawable;
import arc.scene.ui.layout.Table;
import arc.struct.ObjectMap;
import arc.struct.Seq;
import arc.util.Scaling;
import arc.util.Strings;
import mindustry.content.StatusEffects;
import mindustry.ctype.UnlockableContent;
import mindustry.entities.bullet.BulletType;
import mindustry.gen.Tex;
import mindustry.type.Liquid;
import mindustry.type.UnitType;
import mindustry.world.blocks.defense.turrets.Turret;
import mindustry.world.meta.StatUnit;
import mindustry.world.meta.StatValue;
import mindustry.world.meta.StatValues;

import static mindustry.Vars.content;
import static mindustry.Vars.tilesize;

public class EUStatValues {
    public static StatValue stringBoosters(float reload, float maxUsed, float multiplier, boolean baseReload, Boolf<Liquid> filter, String key){
        return table -> {
            table.row();
            table.table(c -> {
                for(Liquid liquid : content.liquids()){
                    if(!filter.get(liquid)) continue;

                    c.image(liquid.uiIcon).size(3 * 8).scaling(Scaling.fit).padRight(4).right().top();
                    c.add(liquid.localizedName).padRight(10).left().top();
                    c.table(Tex.underline, bt -> {
                        bt.left().defaults().padRight(3).left();

                        float reloadRate = (baseReload ? 1f : 0f) + maxUsed * multiplier * liquid.heatCapacity;
                        float standardReload = baseReload ? reload : reload / (maxUsed * multiplier * 0.4f);
                        float result = standardReload / (reload / reloadRate);
                        bt.add(Core.bundle.format(key, Strings.autoFixed(result, 2)));
                    }).left().padTop(-9);
                    c.row();
                }
            }).colspan(table.getColumns());
            table.row();
        };
    }

    /** Anuke写的液体也能用捏 */
    public static <T extends UnlockableContent> StatValue ammo(ObjectMap<T, BulletType[]> map){
        return ammo(map, 0, false);
    }

    public static <T extends UnlockableContent> StatValue ammo(ObjectMap<T, BulletType[]> map, boolean showUnit){
        return ammo(map, 0, showUnit);
    }

    public static <T extends UnlockableContent> StatValue ammo(ObjectMap<T, BulletType[]> map, int indent, boolean showUnit){
        return table -> {

            table.row();

            Seq<T> orderedKeys = map.keys().toSeq();
            orderedKeys.sort();

            for(T t : orderedKeys) {
                boolean compact = t instanceof UnitType && !showUnit || indent > 0;
                if (!compact && !(t instanceof Turret)) {
                    table.image(icon(t)).size(3 * 8).padRight(4).right().top();
                    table.add(t.localizedName).padRight(10).left().top();
                }
                table.row();
                for(BulletType type : map.get(t)){
                    if (type.spawnUnit != null && type.spawnUnit.weapons.size > 0) {
                        ammo(ObjectMap.of(t, type.spawnUnit.weapons.first().bullet), indent, false).display(table);
                        return;
                    }

                    //no point in displaying unit icon twice

                    table.table(bt -> {
                        bt.left().defaults().padRight(3).left();

                        if (type.damage > 0 && (type.collides || type.splashDamage <= 0)) {
                            if (type.continuousDamage() > 0) {
                                bt.add(Core.bundle.format("bullet.damage", type.continuousDamage()) + StatUnit.perSecond.localized());
                            } else {
                                bt.add(Core.bundle.format("bullet.damage", type.damage));
                            }
                        }

                        if (type.buildingDamageMultiplier != 1) {
                            sep(bt, Core.bundle.format("bullet.buildingdamage", (int) (type.buildingDamageMultiplier * 100)));
                        }

                        if (type.rangeChange != 0 && !compact) {
                            sep(bt, Core.bundle.format("bullet.range", (type.rangeChange > 0 ? "+" : "-") + Strings.autoFixed(type.rangeChange / tilesize, 1)));
                        }

                        if (type.splashDamage > 0) {
                            sep(bt, Core.bundle.format("bullet.splashdamage", (int) type.splashDamage, Strings.fixed(type.splashDamageRadius / tilesize, 1)));
                        }

                        if (!compact && !Mathf.equal(type.ammoMultiplier, 1f) && type.displayAmmoMultiplier && (!(t instanceof Turret) || ((Turret)t).displayAmmoMultiplier)) {
                            sep(bt, Core.bundle.format("bullet.multiplier", (int) type.ammoMultiplier));
                        }

                        if (!compact && !Mathf.equal(type.reloadMultiplier, 1f)) {
                            sep(bt, Core.bundle.format("bullet.reload", Strings.autoFixed(type.reloadMultiplier, 2)));
                        }

                        if (type.knockback > 0) {
                            sep(bt, Core.bundle.format("bullet.knockback", Strings.autoFixed(type.knockback, 2)));
                        }

                        if (type.healPercent > 0f) {
                            sep(bt, Core.bundle.format("bullet.healpercent", Strings.autoFixed(type.healPercent, 2)));
                        }

                        if (type.healAmount > 0f) {
                            sep(bt, Core.bundle.format("bullet.healamount", Strings.autoFixed(type.healAmount, 2)));
                        }

                        if (type.pierce || type.pierceCap != -1) {
                            sep(bt, type.pierceCap == -1 ? "@bullet.infinitepierce" : Core.bundle.format("bullet.pierce", type.pierceCap));
                        }

                        if (type.incendAmount > 0) {
                            sep(bt, "@bullet.incendiary");
                        }

                        if (type.homingPower > 0.01f) {
                            sep(bt, "@bullet.homing");
                        }

                        if (type.lightning > 0) {
                            sep(bt, Core.bundle.format("bullet.lightning", type.lightning, type.lightningDamage < 0 ? type.damage : type.lightningDamage));
                        }

                        if (type.pierceArmor) {
                            sep(bt, "@bullet.armorpierce");
                        }

                        if (type.status != StatusEffects.none) {
                            sep(bt, (type.status.minfo.mod == null ? type.status.emoji() : "") + "[stat]" + type.status.localizedName + "[lightgray] ~ [stat]" + ((int) (type.statusDuration / 60f)) + "[lightgray] " + Core.bundle.get("unit.seconds"));
                        }

                        if (type.fragBullet != null) {
                            sep(bt, Core.bundle.format("bullet.frags", type.fragBullets));
                            bt.row();

                            StatValues.ammo(ObjectMap.of(t, type.fragBullet), indent + 1, false).display(bt);
                        }
                    }).padTop(compact ? 0 : -9).padLeft(indent * 8).left().get().background(compact ? null : Tex.underline);

                    table.row();
                }
            }
        };
    }
    private static void sep(Table table, String text){
        table.row();
        table.add(text);
    }

    private static TextureRegion icon(UnlockableContent t){
        return t.uiIcon;
    }

    public static StatValue colorString(Color color, CharSequence s){
        return table -> {
            table.row();
            table.table(c -> {
                c.image(((TextureRegionDrawable)Tex.whiteui).tint(color)).size(32).scaling(Scaling.fit).padRight(4).left().top();
                c.add(s).padRight(10).left().top();
            }).left();
            table.row();
        };
    }
}