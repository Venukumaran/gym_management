package gym.demo.entity;


import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@Table(name="gymdetails")
public class member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must contain 2-100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message ="Enter a valid email")
    @Column(unique = true)
    private String email;

    @NotNull(message = "Age must be enteres")
    @Min(value = 16, message = "Minimum age is 16")
    private int age;


    @NotBlank(message = "Gender is required")
    private String gender;

    @NotBlank(message = "Membership plan is required")
    private String membershipPlan;

    @NotNull(message = "Joining date is required")
    private LocalDate joiningDate;

    @NotNull(message = "Expiry date is required")
    private LocalDate expiryDate;

    @NotBlank(message = "Status is required")
    private String status;



}
