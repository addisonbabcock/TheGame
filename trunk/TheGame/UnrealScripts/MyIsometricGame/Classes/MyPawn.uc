class MyPawn extends GamePawn;


simulated function name GetDefaultCameraMode( PlayerController RequestedBy )
{
		return 'Isometric';
}

defaultproperties
{
        Components.Remove(Sprite)

        Begin Object Class=DynamicLightEnvironmentComponent Name=MyLightEnvironment
                ModShadowFadeoutTime=0.25
                MinTimeBetweenFullUpdates=0.2
                AmbientGlow=(R=.01,G=.01,B=.01,A=1)
                AmbientShadowColor=(R=0.15,G=0.15,B=0.15)
                LightShadowMode=LightShadow_ModulateBetter
                ShadowFilterQuality=SFQ_High
                bSynthesizeSHLight=TRUE
        End Object
        Components.Add(MyLightEnvironment)

    Begin Object Class=SkeletalMeshComponent Name=InitialSkeletalMesh
                CastShadow=true
                bCastDynamicShadow=true
                bOwnerNoSee=false
                LightEnvironment=MyLightEnvironment;
        BlockRigidBody=true;
        CollideActors=true;
        BlockZeroExtent=true;
                PhysicsAsset=PhysicsAsset'CH_AnimCorrupt.Mesh.SK_CH_Corrupt_Male_Physics'
                AnimSets(0)=AnimSet'CH_AnimHuman.Anims.K_AnimHuman_AimOffset'
                AnimSets(1)=AnimSet'CH_AnimHuman.Anims.K_AnimHuman_BaseMale'
                AnimTreeTemplate=AnimTree'CH_AnimHuman_Tree.AT_CH_Human'
                SkeletalMesh=SkeletalMesh'CH_LIAM_Cathode.Mesh.SK_CH_LIAM_Cathode'
        End Object

        Mesh=InitialSkeletalMesh;
        Components.Add(InitialSkeletalMesh);
}