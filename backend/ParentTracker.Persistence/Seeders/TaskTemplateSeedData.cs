using ParentTracker.Domain.Entities;

namespace ParentTracker.Persistence.Seeders;

public static class TaskTemplateSeedData
{
    public static IEnumerable<TaskTemplate> GetTemplates() =>
    [
        // Okul
        new() { Id = new Guid("00000001-0000-0000-0000-000000000001"), Title = "Ödevimi bitirdim", Category = "Okul", DefaultPoints = 15, SuggestedAgeMin = 6, SuggestedAgeMax = 11 },
        new() { Id = new Guid("00000001-0000-0000-0000-000000000002"), Title = "Çantamı hazırladım", Category = "Okul", DefaultPoints = 10, SuggestedAgeMin = 6, SuggestedAgeMax = 11 },
        new() { Id = new Guid("00000001-0000-0000-0000-000000000003"), Title = "Derslerimi tekrar ettim", Category = "Okul", DefaultPoints = 15, SuggestedAgeMin = 7, SuggestedAgeMax = 11 },

        // Okuma
        new() { Id = new Guid("00000001-0000-0000-0000-000000000004"), Title = "20 dakika kitap okudum", Category = "Okuma", DefaultPoints = 15, SuggestedAgeMin = 6, SuggestedAgeMax = 11 },
        new() { Id = new Guid("00000001-0000-0000-0000-000000000005"), Title = "Bir hikaye kitabı bitirdim", Category = "Okuma", DefaultPoints = 25, SuggestedAgeMin = 6, SuggestedAgeMax = 11 },

        // Kişisel bakım
        new() { Id = new Guid("00000001-0000-0000-0000-000000000006"), Title = "Dişlerimi fırçaladım", Category = "Kişisel bakım", DefaultPoints = 10, SuggestedAgeMin = 4, SuggestedAgeMax = 11 },
        new() { Id = new Guid("00000001-0000-0000-0000-000000000007"), Title = "Duşumu aldım", Category = "Kişisel bakım", DefaultPoints = 10, SuggestedAgeMin = 6, SuggestedAgeMax = 11 },
        new() { Id = new Guid("00000001-0000-0000-0000-000000000008"), Title = "Saçımı taradım", Category = "Kişisel bakım", DefaultPoints = 5, SuggestedAgeMin = 4, SuggestedAgeMax = 11 },

        // Ev düzeni
        new() { Id = new Guid("00000001-0000-0000-0000-000000000009"), Title = "Odamı topladım", Category = "Ev düzeni", DefaultPoints = 15, SuggestedAgeMin = 5, SuggestedAgeMax = 11 },
        new() { Id = new Guid("00000001-0000-0000-0000-000000000010"), Title = "Yatağımı düzelttim", Category = "Ev düzeni", DefaultPoints = 10, SuggestedAgeMin = 5, SuggestedAgeMax = 11 },
        new() { Id = new Guid("00000001-0000-0000-0000-000000000011"), Title = "Oyuncaklarımı kaldırdım", Category = "Ev düzeni", DefaultPoints = 10, SuggestedAgeMin = 4, SuggestedAgeMax = 9 },

        // Uyku
        new() { Id = new Guid("00000001-0000-0000-0000-000000000012"), Title = "Zamanında yatağa gittim", Category = "Uyku", DefaultPoints = 10, SuggestedAgeMin = 4, SuggestedAgeMax = 11 },
        new() { Id = new Guid("00000001-0000-0000-0000-000000000013"), Title = "Uyumadan önce kitap okudum", Category = "Uyku", DefaultPoints = 10, SuggestedAgeMin = 6, SuggestedAgeMax = 11 },

        // Sağlık
        new() { Id = new Guid("00000001-0000-0000-0000-000000000014"), Title = "Su içtim (8 bardak)", Category = "Sağlık", DefaultPoints = 5, SuggestedAgeMin = 4, SuggestedAgeMax = 11 },
        new() { Id = new Guid("00000001-0000-0000-0000-000000000015"), Title = "Sebze veya meyve yedim", Category = "Sağlık", DefaultPoints = 10, SuggestedAgeMin = 4, SuggestedAgeMax = 11 },

        // Spor
        new() { Id = new Guid("00000001-0000-0000-0000-000000000016"), Title = "30 dakika spor yaptım", Category = "Spor", DefaultPoints = 15, SuggestedAgeMin = 5, SuggestedAgeMax = 11 },
        new() { Id = new Guid("00000001-0000-0000-0000-000000000017"), Title = "Bisiklete bindim", Category = "Spor", DefaultPoints = 10, SuggestedAgeMin = 5, SuggestedAgeMax = 11 },
        new() { Id = new Guid("00000001-0000-0000-0000-000000000018"), Title = "Yürüyüşe çıktım", Category = "Spor", DefaultPoints = 10, SuggestedAgeMin = 6, SuggestedAgeMax = 11 },

        // Aile
        new() { Id = new Guid("00000001-0000-0000-0000-000000000019"), Title = "Sofra hazırlamaya yardım ettim", Category = "Aile", DefaultPoints = 10, SuggestedAgeMin = 5, SuggestedAgeMax = 11 },
        new() { Id = new Guid("00000001-0000-0000-0000-000000000020"), Title = "Bulaşıkları kaldırdım", Category = "Aile", DefaultPoints = 10, SuggestedAgeMin = 6, SuggestedAgeMax = 11 },
        new() { Id = new Guid("00000001-0000-0000-0000-000000000021"), Title = "Çöpü çıkardım", Category = "Aile", DefaultPoints = 10, SuggestedAgeMin = 7, SuggestedAgeMax = 11 },
    ];
}
